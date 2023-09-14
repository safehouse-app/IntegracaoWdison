var http = require("http");

// Cria um servidor HTTP e uma escuta de requisições para a porta 8000
const fs = require('fs');
const db = require("./db.js");
http.createServer(async function (request, response) {
    const headers = {
        'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000, // 30 days
        /** add other headers as per requirement */
    };
    console.log(request.method);
    console.log(request.url);
    var OK = "OK";
    try {
        switch (request.method) {
            case 'OPTIONS': {
                console.log("OPTIONS");
                response.write("OPTIONS");
                response.end();


            }
            case 'POST': {
                var body = '';
                request.on('data', function (chunk) {
                    body += chunk;
                });
                request.on('end', async function () {
                    const jsonStartIndex = body.indexOf("{");
                    const jsonEndIndex = body.lastIndexOf("}");
                    const jsonBody = body.substring(jsonStartIndex, jsonEndIndex + 1);
                    const responseJson = JSON.parse(jsonBody);
                    console.log(responseJson.eventDescription);
                    if (responseJson.eventDescription == "Access Controller Event") {
                        var sql = "ca.sp_insert_acesso  '" + responseJson.AccessControllerEvent.currentVerifyMode + "'," +
                            "'" + (responseJson.AccessControllerEvent.employeeNoString != undefined ? responseJson.AccessControllerEvent.employeeNoString : 0) + "'," +
                            "'" + responseJson.dateTime.substring(0, 19) + "'," +
                            //"'" + responseJson.dateTime + "'," +
                            "'" + responseJson.ipAddress + "'," +
                            responseJson.AccessControllerEvent.serialNo;
                        var resposta = await db.execConsultas(sql);
                        console.log(sql);
                    }

                });
                response.write("POST");
                //  response.end();


            }

            case 'GET':
                {

                    console.log("GET");
                    response.write("GET");
                    response.end();
                }

        }


    } catch (ex) {
        console.log("erro " + ex);
    }


}).listen(3006, '0.0.0.0');
