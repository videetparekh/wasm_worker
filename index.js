// import the emscripten glue code
import { PNG } from "../tinymodel_int8/node_modules/pngjs/browser"
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
                      var responses = [];

                      reader.addEventListener('load', function () {
                        let imgEl = document.getElementById("img_el");
                        imgEl.src = reader.result;
                        imgEl.setAttribute("width", 96);
                        imgEl.setAttribute("height", 96);
                        document.body.append(imgEl);
                      
                        for (var i=0;i<50;i++) {
                          fetch(location.href, {
                            method: "POST",
                            body: reader.result
                          })
                          .then(async function(res) {
                            return res.json()
                          })
                          .then(pred => {
                            // console.log(pred)
                            responses.push(pred)
                            // document.getElementById("pred").innerText = "Prediction: " + pred["label"]
                            // document.getElementById("model-time").innerText = "Model Load time: " + pred["loadtime"] + "ms"
                            // document.getElementById("inf-time").innerText = "Inference time: " + pred["inftime"] + "ms"
                            // document.getElementById("total-time").innerText = "Total time: " + pred["totaltime"] + "ms"
                            document.getElementById("resp").innerText = JSON.stringify(responses)
                            });
                        }
                      }, false);
                        
                      if (file) {reader.readAsDataURL(file);}
                    }
                  </script>
                  <img id="img_el"></img>
                  <p id ="pred"></p>
                  <p id="model-time"></p>
                  <p id="inf-time"></p>
                  <p id="total-time"></p>
                  <p id="resp"></p>
                </body>
              </html>
            `)
            res.headers.set('content-type', 'text/html')
            return res

        } else if (request.method === 'POST') {
            var start = now()
            var status = null
            var resp_obj;
            // Tiny Model - ENFORCED (For Now)
            const modelType = 'tinymodel'
            const variantType = 'fp32'
            var modelInfo = models.collectModel(modelType, variantType) // Refactor to support Selection of Model Variant
            var synset = await utils.getLabels(modelInfo["labels"])
            const base64String = await request.text()
            const [dtype, data] = base64String.split(",")
            let rawImgData = null
            console.log('here')
            if (dtype === 'data:image/jpeg;base64') {
                rawImgData = jpeg.decode(preproc.base64ToArrayBuffer(data))
            }
            status = "decoded"


            var status = "preprocessed"
            await runtime.invoke(modelInfo, rawImgData).then(obj => {
                var end = now() - start
                resp_obj = { "label": synset[obj["label"]], "loadtime": obj["loadtime"].toFixed(7).toString(), "inftime": obj["inftime"].toFixed(7).toString(), "totaltime": end.toFixed(2).toString() }
                    // resp_obj = { "label": labels[label], "loadtime": loadtime.reduce((a, b) => a + b, 0), "inftime": inftime, "status": status }

            })
            var response = new Response(JSON.stringify(resp_obj), { status: 200 });
            response.headers.set('Access-Control-Allow-Origin', "*")
            response.headers.append('Vary', 'Origin')
            return response
        }
    } catch (e) {
        console.log(e)
        var response = new Response(JSON.stringify({ "error": e.message }), { status: 200 });
        response.headers.set('Access-Control-Allow-Origin', new URL(request.url).origin)
        response.headers.append('Vary', 'Origin')
        return response
    }
}