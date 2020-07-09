import "@webgpu/types";
import { Memory } from "./memory";
/** A pointer to points to the raw address space. */
export declare type GPUPointer = number;
/**
 * DetectGPU device in the environment.
 */
export declare function detectGPUDevice(): Promise<GPUDevice | undefined>;
/**
 * WebGPU context
 * Manages all the webgpu resources here.
 */
export declare class WebGPUContext {
    device: GPUDevice;
    memory: Memory;
    private bufferTable;
    private bufferTableFreeId;
    private pendingRead;
    private numPendingReads;
    constructor(memory: Memory, device: GPUDevice);
    /**
     * Wait for all pending GPU tasks to complete
     */
    sync(): Promise<void>;
    /**
     * Create a PackedFunc that runs the given shader
     *
     * @param info The function information in json.
     * @param data The shader data(in SPIRV)
     */
    createShader(info: string, data: Uint8Array): Function;
    /**
     * Get the device API according to its name
     * @param The name of the API.
     * @returns The corresponding device api.
     */
    getDeviceAPI(name: string): Function;
    private deviceAllocDataSpace;
    private deviceFreeDataSpace;
    private deviceCopyToGPU;
    private deviceCopyFromGPU;
    private deviceCopyWithinGPU;
    private gpuBufferFromPtr;
    private attachToBufferTable;
}
