module.exports = {
    preprocess_imagenet: function(imageData) {
        var rgbFP32 = new Float32Array(cleanAndStripAlpha(imageData))
        var normArray = rgbFP32.map(normalize)
        return normArray
    },

    preprocess_uint8: function(imageData) {
        var rgbU8 = cleanAndStripAlpha(imageData)
        return rgbU8;
    },

    base64ToArrayBuffer: function(base64) {
        var binary_string = atob(base64)
        var len = binary_string.length
        var bytes = new Uint8Array(len)

        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i)
        }
        return bytes.buffer
    }

}

/*
Expectation for a Preprocessor function:

Function expects (imageData: output of drawCanvas function) { returns Array} 
*/

function cleanAndStripAlpha(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const npixels = width * height;

    const rgbaU8 = imageData.data;

    // Drop alpha channel
    const rgbU8 = new Uint8Array(npixels * 3);
    for (let i = 0; i < npixels; ++i) {
        rgbU8[i * 3] = rgbaU8[i * 4];
        rgbU8[i * 3 + 1] = rgbaU8[i * 4 + 1];
        rgbU8[i * 3 + 2] = rgbaU8[i * 4 + 2];
    }
    return rgbU8;
}

function normalize(a) {
    return ((a / 127.5) - 1.0)
}