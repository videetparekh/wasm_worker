const path = require("path");
const now = require("performance-now");
import emscripten from '../build/module.js'

export async function invoke(modelInfo, imageData) {
    var loadtime = 0.0
    var inferencetime = 0.0

    //Collect and load weights and graph file
    var start = now()
    var temp = await (await fetch(modelInfo['base'] + modelInfo['graph'])).json()
    delete temp['leip']
    const graphJson = JSON.stringify(temp)
    const paramsBinary = new Uint8Array(await (await fetch(modelInfo["base"] + modelInfo["params"])).arrayBuffer())

    // TVM Loader WASM and create Runtime
    const lrejs = require("../runtime_dist");
    const wasmPath = lrejs.wasmPath();
    // delete require.cache[require.resolve(path.join(wasmPath, "tvmjs_runtime.wasi.js"))]
    const EmccWASI = require("../runtime_dist/wasm/tvmjs_runtime.wasi.js");
    var WasiObj = new EmccWASI()
    if (modelInfo["input_type"] == "uint8" || modelInfo["input_type"] == "int8") {
        WasiObj['Module']['wasmLibraryProvider']['imports']['env']['roundf'] = Math.round
    }
    var label;

    emscripten({
        instantiateWasm(info, receive) {

            let lre = new lrejs.Instance(wasm, WasiObj)
            receive(lre)
            const ctx = lre.cpu()
            const sysLib = lre.systemLib()
            const executor = lre.createGraphRuntime(graphJson, sysLib, ctx)
            executor.loadParams(paramsBinary)

            const inputData = lre.empty(modelInfo["input_shape"], modelInfo["input_type"], lre.cpu());
            const outputData = lre.empty(modelInfo["output_shape"], modelInfo["input_type"], lre.cpu());
            const outputGPU = executor.getOutput(0);
            loadtime = now() - start
            try {
                var inf_start = now()
                var processedImage = modelInfo["preprocessor"](imageData)
                inputData.copyFrom(processedImage);
                executor.setInput(modelInfo["input_name"], inputData);
                executor.run();
                outputData.copyFrom(outputGPU);
                const sortedIndex = Array.from(outputData.toArray())
                    .map((value, index) => [value, index])
                    .sort(([a], [b]) => b - a)
                    .map(([, index]) => index);
                // for (let i = 0; i < 5; ++i) {
                //     console.log("Top-" + (i + 1) + " " + synset[sortedIndex[i]]);
                // }
                inferencetime = now() - inf_start
                label = sortedIndex[0];
            } catch (e) {
                label = e.message
            }





        }
    })
    return {
        label: label,
        loadtime: loadtime,
        inftime: inferencetime
    }
}