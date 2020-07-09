"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebGPUContext = exports.detectGPUDevice = void 0;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
const support_1 = require("./support");
/**
 * DetectGPU device in the environment.
 */
function detectGPUDevice() {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof navigator !== "undefined" && navigator.gpu !== undefined) {
            const adapter = yield navigator.gpu.requestAdapter();
            return yield adapter.requestDevice();
        }
        else {
            return undefined;
        }
    });
}
exports.detectGPUDevice = detectGPUDevice;
/**
 * WebGPU context
 * Manages all the webgpu resources here.
 */
class WebGPUContext {
    constructor(memory, device) {
        //private readBuffer:;
        this.bufferTable = [undefined];
        this.bufferTableFreeId = [];
        this.pendingRead = Promise.resolve();
        this.numPendingReads = 0;
        this.memory = memory;
        this.device = device;
    }
    /**
     * Wait for all pending GPU tasks to complete
     */
    sync() {
        return __awaiter(this, void 0, void 0, function* () {
            const fence = this.device.defaultQueue.createFence();
            this.device.defaultQueue.signal(fence, 1);
            if (this.numPendingReads != 0) {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                yield Promise.all([fence.onCompletion(1), this.pendingRead]);
            }
            else {
                yield fence.onCompletion(1);
            }
        });
    }
    /**
     * Create a PackedFunc that runs the given shader
     *
     * @param info The function information in json.
     * @param data The shader data(in SPIRV)
     */
    createShader(info, data) {
        const finfo = JSON.parse(info);
        const layoutEntries = [];
        for (let i = 0; i < finfo.arg_types.length; ++i) {
            const dtype = finfo.arg_types[i];
            if (dtype == "handle") {
                layoutEntries.push({
                    binding: i,
                    visibility: GPUShaderStage.COMPUTE,
                    type: "storage-buffer"
                });
            }
            else {
                throw new Error("Cannot handle argument type " + dtype + " in WebGPU shader");
            }
        }
        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: layoutEntries
        });
        const pipeline = this.device.createComputePipeline({
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout]
            }),
            computeStage: {
                module: this.device.createShaderModule({
                    code: new Uint32Array(data.buffer)
                }),
                entryPoint: "main"
            }
        });
        const dispatchToDim = [];
        for (let i = 0; i < finfo.thread_axis_tags.length; ++i) {
            const tag = finfo.thread_axis_tags[i];
            if (tag.startsWith("blockIdx.")) {
                const target = tag.charCodeAt(tag.length - 1) - ("x".charCodeAt(0));
                support_1.assert(target >= 0 && target < 3);
                dispatchToDim.push(target);
            }
            else if (tag.startsWith("threadIdx.")) {
                const target = tag.charCodeAt(tag.length - 1) - ("x".charCodeAt(0));
                support_1.assert(target >= 0 && target < 3);
                dispatchToDim.push(target + 3);
            }
            else {
                throw new Error("Cannot handle thread_axis " + tag);
            }
        }
        const submitShader = (...args) => {
            const commandEncoder = this.device.createCommandEncoder();
            const compute = commandEncoder.beginComputePass();
            compute.setPipeline(pipeline);
            const bindGroupEntries = [];
            support_1.assert(args.length == layoutEntries.length + dispatchToDim.length);
            for (let i = 0; i < layoutEntries.length; ++i) {
                bindGroupEntries.push({
                    binding: i,
                    resource: {
                        buffer: this.gpuBufferFromPtr(args[i])
                    }
                });
            }
            compute.setBindGroup(0, this.device.createBindGroup({
                layout: bindGroupLayout,
                entries: bindGroupEntries
            }));
            const wl = [1, 1, 1, 1, 1, 1];
            for (let i = 0; i < dispatchToDim.length; ++i) {
                wl[dispatchToDim[i]] = args[layoutEntries.length + i];
            }
            compute.dispatch(wl[0], wl[1], wl[2]);
            compute.endPass();
            const command = commandEncoder.finish();
            this.device.defaultQueue.submit([command]);
        };
        return submitShader;
    }
    /**
     * Get the device API according to its name
     * @param The name of the API.
     * @returns The corresponding device api.
     */
    getDeviceAPI(name) {
        if (name == "deviceAllocDataSpace") {
            return (nbytes) => {
                return this.deviceAllocDataSpace(nbytes);
            };
        }
        else if (name == "deviceFreeDataSpace") {
            return (ptr) => {
                return this.deviceFreeDataSpace(ptr);
            };
        }
        else if (name == "deviceCopyToGPU") {
            return (from, to, toOffset, nbytes) => {
                this.deviceCopyToGPU(from, to, toOffset, nbytes);
            };
        }
        else if (name == "deviceCopyFromGPU") {
            return (from, fromOffset, to, nbytes) => {
                this.deviceCopyFromGPU(from, fromOffset, to, nbytes);
            };
        }
        else if (name == "deviceCopyWithinGPU") {
            return (from, fromOffset, to, toOffset, nbytes) => {
                this.deviceCopyWithinGPU(from, fromOffset, to, toOffset, nbytes);
            };
        }
        else {
            throw new Error("Unknown DeviceAPI function " + name);
        }
    }
    // DeviceAPI
    deviceAllocDataSpace(nbytes) {
        const buffer = this.device.createBuffer({
            size: nbytes,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        return this.attachToBufferTable(buffer);
    }
    deviceFreeDataSpace(ptr) {
        const idx = ptr;
        const buffer = this.bufferTable[idx];
        this.bufferTable[idx] = undefined;
        support_1.assert(buffer !== undefined);
        this.bufferTableFreeId.push(idx);
        buffer.destroy();
    }
    deviceCopyToGPU(from, to, toOffset, nbytes) {
        // Perhaps it would be more useful to use a staging buffer?
        const [gpuTemp, cpuTemp] = this.device.createBufferMapped({
            size: nbytes,
            usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC,
        });
        const viewU8 = new Uint8Array(cpuTemp);
        viewU8.set(this.memory.loadRawBytes(from, nbytes));
        gpuTemp.unmap();
        const copyEncoder = this.device.createCommandEncoder();
        copyEncoder.copyBufferToBuffer(gpuTemp, 0, this.gpuBufferFromPtr(to), toOffset, nbytes);
        const copyCommands = copyEncoder.finish();
        this.device.defaultQueue.submit([copyCommands]);
        gpuTemp.destroy();
    }
    deviceCopyFromGPU(from, fromOffset, to, nbytes) {
        // Perhaps it would be more useful to resuse a staging buffer?
        const gpuTemp = this.device.createBuffer({
            size: nbytes,
            usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
        });
        const copyEncoder = this.device.createCommandEncoder();
        copyEncoder.copyBufferToBuffer(this.gpuBufferFromPtr(from), fromOffset, gpuTemp, 0, nbytes);
        const copyCommands = copyEncoder.finish();
        this.device.defaultQueue.submit([copyCommands]);
        this.numPendingReads += 1;
        const readEvent = gpuTemp.mapReadAsync().then((data) => {
            this.memory.storeRawBytes(to, new Uint8Array(data));
            this.numPendingReads -= 1;
            gpuTemp.destroy();
        });
        if (this.numPendingReads == 1) {
            this.pendingRead = readEvent;
        }
        else {
            this.pendingRead = Promise.all([
                this.pendingRead,
                readEvent,
            ]).then(() => { });
        }
    }
    deviceCopyWithinGPU(from, fromOffset, to, toOffset, nbytes) {
        const copyEncoder = this.device.createCommandEncoder();
        copyEncoder.copyBufferToBuffer(this.gpuBufferFromPtr(from), fromOffset, this.gpuBufferFromPtr(to), toOffset, nbytes);
        const copyCommands = copyEncoder.finish();
        this.device.defaultQueue.submit([copyCommands]);
    }
    gpuBufferFromPtr(ptr) {
        const buffer = this.bufferTable[ptr];
        support_1.assert(buffer !== undefined);
        return buffer;
    }
    attachToBufferTable(buffer) {
        if (this.bufferTableFreeId.length != 0) {
            const idx = this.bufferTableFreeId.pop();
            this.bufferTable[idx] = buffer;
            return idx;
        }
        else {
            const idx = this.bufferTable.length;
            this.bufferTable.push(buffer);
            return idx;
        }
    }
}
exports.WebGPUContext = WebGPUContext;
//# sourceMappingURL=webgpu.js.map
