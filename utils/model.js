var preproc = require('../utils/preprocessor.js')

module.exports = {
    collectModel: function(modelType, variantType) {

        //This function owns a database that links a modelType string passed User's post call to the function that contains the model's data

        modelDatabase = {
            "mobilenetv2": MobileNetv2,
            "tiny": TinyModel,
        }
        return modelDatabase[modelType](variantType)

    }
}

function MobileNetv2(variantType) {
    // The base path is the path to the folder containing the params and graph files
    // The modelObj provides filenames relative to the basepath collected from ModelInfo

    var modelBase = "https://storage.googleapis.com/mobilenetv2/"

    const modelInfo = {
        "baseline": { "base": modelBase + "baseline/", "input_type": "float32", "preprocessor": preproc.preprocess_imagenet },
        "reimann": { "base": modelBase + "reimann/", "input_type": "float32", "preprocessor": preproc.preprocess_imagenet },
        "lorenz_int8": { "base": modelBase + "lorenz_int8/", "input_type": "uint8", "preprocessor": preproc.preprocess_uint8 },
        "lorenz_int16": { "base": modelBase + "lorenz_int16/", "input_type": "uint8", "preprocessor": preproc.preprocess_uint8 }
    }

    var modelObj = {
        "graph": "modelDescription.json",
        "params": "modelParams.params",
        "wasm": "modelLibrary.wasm",
        "labels": modelBase + "open_images_labels.json",
        "input_shape": [1, 3, 224, 224],
        "input_name": "input_1",
        "output_shape": [1, 10]
    }

    modelObj = Object.assign(modelObj, modelInfo[variantType])

    return modelObj
}

function TinyModel(variantType) {
    // The base path is the path to the folder containing the params and graph files
    // The modelObj provides filenames relative to the basepath collected from ModelInfo

    const modelBase = "https://storage.googleapis.com/tinymodel/"

    const modelInfo = {
        "baseline": { "base": modelBase + "baseline/", "input_type": "float32", "preprocessor": preproc.preprocess_imagenet },
        "reimann": { "base": modelBase + "reimann/", "input_type": "float32", "preprocessor": preproc.preprocess_imagenet },
        "lorenz_int8": { "base": modelBase + "lorenz_int8/", "input_type": "uint8", "preprocessor": preproc.preprocess_uint8 },
        "lorenz_int16": { "base": modelBase + "lorenz_int16/", "input_type": "uint8", "preprocessor": preproc.preprocess_uint8 }
    }

    var modelObj = {
        "graph": "modelDescription.json",
        "params": "modelParams.params",
        "wasm": "modelLibrary.wasm",
        "labels": modelBase + "person_classifier_labels.json",
        "input_shape": [1, 3, 96, 96],
        "input_name": "MobilenetV2/input",
        "output_shape": [1, 2]
    }

    modelObj = Object.assign(modelObj, modelInfo[variantType])

    return modelObj
}


/*
Expectation for a Model Schema:

Function expects (VariantType: string) { returns modelObj} 
*/