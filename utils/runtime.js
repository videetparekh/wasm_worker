const path = require("path");
const now = require("performance-now");

module.exports = {
    tvmSetup: async function(modelInfo) {

        // this is where the magic happens
        // we send our own instantiateWasm function
        // to the emscripten module
        // so we can initialize the WASM instance ourselves
        // since Workers puts your wasm file in global scope
        // as a binding. In this case, this binding is called
        // `wasm` as that is the name Wrangler uses
        // for any uploaded wasm module


        /*
        let emscripten_module = new Promise((resolve, reject) => {
            emscripten({
                instantiateWasm(info, receive) {
                    let instance = new WebAssembly.Instance(wasm, info)
                    receive(instance)
                    return instance.exports
                },
            }).then(module => {
                resolve({
                    init: module.cwrap('init', 'number', ['number']),
                    resize: module.cwrap('resize', 'number', ['number', 'number']),
                    module: module,
                })
            })
        })
        */


        // let resizer = await emscripten_module
        // let bytes = new Uint8Array(await response.arrayBuffer())
        // let ptr = resizer.init(bytes.length)
        // resizer.module.HEAPU8.set(bytes, ptr)
        // let newSize = resizer.resize(bytes.length, parseInt(width))
        // if (newSize == 0) {
        //     return new Response(bytes, response)
        // }
        // let resultBytes = resizer.module.HEAPU8.slice(ptr, ptr + newSize)


        var loadtime = [0.0, 0.0, 0.0, []]

        //Collect and load weights and graph file
        var start = now()
        var temp = await (await fetch(modelInfo['base'] + modelInfo['graph'])).json()
        delete temp['leip']
        const graphJson = JSON.stringify(temp)
            // console.log(await (await fetch(modelInfo["base"] + modelInfo["params"])).text())
        const paramsBinary = await new Uint8Array(await (await fetch(modelInfo["base"] + modelInfo["params"])).arrayBuffer())
        console.log(paramsBinary)
        loadtime[1] = now() - start

        // TVM Loader WASM and create Runtime
        start = now()
        const tvmjs = require("../runtime_dist");
        const wasmPath = tvmjs.wasmPath();
        // delete require.cache[require.resolve(path.join(wasmPath, "tvmjs_runtime.wasi.js"))]
        const EmccWASI = require("../runtime_dist/wasm/tvmjs_runtime.wasi.js");
        var WasiObj = new EmccWASI()
        if (modelInfo["input_type"] == "uint8" || modelInfo["input_type"] == "int8") {
            WasiObj['Module']['wasmLibraryProvider']['imports']['env']['roundf'] = Math.round
        }

        emscripten({
            instantiateWasm(info, receive) {
                let instance = new WebAssembly.Instance(wasm, WasiObj)
                receive(instance)
                return instance.exports
            },
        }).then(tvm => {
            ctx = tvm.cpu(0)
            const sysLib = tvm.systemLib()
                // console.log(sysLib)
            const executor = tvm.createGraphRuntime(graphJson, sysLib, ctx)
            loadtime[0] = now() - start

            // Populate weights into graph
            start = now()
            executor.loadParams(paramsBinary)
            const inputData = tvm.empty(modelInfo["input_shape"], modelInfo["input_type"], tvm.cpu());
            const outputData = tvm.empty(modelInfo["output_shape"], modelInfo["input_type"], tvm.cpu());
            const outputGPU = executor.getOutput(0);

            classifier = {}

            classifier.classify = async(imageData) => {
                inputData.copyFrom(imageData);
                // console.log(inputData)
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
                return sortedIndex[0];
            }
            loadtime[2] = now() - start
            resolve([classifier, loadtime]);
        })
    }
}