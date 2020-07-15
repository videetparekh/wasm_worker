// import the emscripten glue code
import { PNG } from "pngjs/browser"
import str from 'string-to-stream'
var jpeg = require('jpeg-js')
var now = require('performance-now')

// Local Libraries
var models = require('./utils/model.js')
var preproc = require('./utils/preprocessor.js')
var utils = require('./utils/common_utils.js')
var runtime = require('./utils/runtime.js')

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})

async function handleRequest({ request }) {
    try {
        if (request.method === 'GET') {
            const res = new Response(`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="UTF-8">
                  <title>MobileNetv2</title>
                </head>

                <body>
                  Upload an image (JPEG or PNG):
                  <input type="file" onchange="post()"/>

                  <script>
                    function post() {
                      var file = document.querySelector('input[type=file]').files[0];
                      var reader = new FileReader();

                      reader.addEventListener('load', function () {
                        let imgEl = document.getElementById("img_el");
                        imgEl.src = reader.result;
                        imgEl.setAttribute("width", 96);
                        imgEl.setAttribute("height", 96);
                        document.body.append(imgEl);
                      
                        fetch(location.href, {
                          method: "POST",
                          body: reader.result
                        })
                        .then(async function(res) {
                          if (res.ok) {
                            console.log("Response ok.")
                            try {return await res.json()} catch(e){console.log("Failed.", res.text(), e)}
                          } else {
                            console.log(await res.text())
                            document.getElementById("pred").innerText = "Worker exceeded limits."
                          }
                        })
                        .then(pred => {
                          console.log(pred)
                          document.getElementById("pred").innerText = "Prediction: " + pred.label
                          document.getElementById("model-time").innerText = "Model Load time: " + pred["model-time"]
                          document.getElementById("inf-time").innerText = "Inference time: " + pred["inf-time"]
                        });
                      }, false);

                      if (file) {reader.readAsDataURL(file);}
                    }
                  </script>
                  <img id="img_el"></img>
                  <p id ="pred"></p>
                  <p id="model-time"></p>
                  <p id="inf-time"></p>
                </body>
              </html>
            `)
            res.headers.set('content-type', 'text/html')
            return res

        } else if (request.method === 'POST') {
            // Tiny Model - ENFORCED (For Now)
            const modelType = 'tiny'
            const variantType = 'baseline'
            var modelInfo = models.collectModel(modelType, variantType) // Refactor to support Selection of Model Variant
            var labels = await utils.getLabels(modelInfo["labels"])

            //
            // Load Runtime - Needs to be updated to support loading TVM correctly!!!!! 
            //
            var [classifier, loadtime] = await runtime.lreSetup(modelInfo) // Multiple Inference - Single Load

            //
            //
            //

            const base64String = await request.text()
            const [dtype, data] = base64String.split(",")
            let rawImgData = null
            if (dtype === 'data:image/jpeg;base64') {
                rawImgData = jpeg.decode(preproc.base64ToArrayBuffer(data))
            }
            var processedImage = modelInfo["preprocessor"](rawImgData)

            var label = await classifier.classify(processedImage)
            resp_obj = { "label": labels[label], "loadtime": loadtime.reduce((a, b) => a + b, 0), "inftime": inftime }
            return new Response(JSON.stringify(resp_obj), { status: 200 });
        }
    } catch (e) {
        console.log(e)
    }
}