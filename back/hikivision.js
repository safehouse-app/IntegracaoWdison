const request = require('request-promise');
const funcao_delete = "/ISAPI/AccessControl/UserInfo/Delete?format=json";
const funcao_add = "/ISAPI/AccessControl/UserInfo/SetUp?format=json";
const funcao_pesquisar_todos = "/ISAPI/AccessControl/UserInfo/Search?format=json";


async function getAllUsers(maxresult, position, ip_equipamento, usuario, senha) {
    var json = true;
    var funcao = funcao_pesquisar_todos;
    var params = {
        "UserInfoSearchCond": {
            "searchID": "1",
            "searchResultPosition": parseInt(position),
            "maxResults": parseInt(maxresult)
        }
    };
    url = "http://" + ip_equipamento + funcao;
    return await invokeHikivision('POST', url, usuario, senha, json, params);
}


async function deletarUsuarioDevice(id, ip_equipamento, usuario, senha) {
    var json = true;
    var funcao = funcao_delete;
    var params = {
        "UserInfoDelCond": {
            "EmployeeNoList": [
                {
                    "employeeNo":  "" + id + ""
                }
            ]
        }
    }
    url = "http://" + ip_equipamento + funcao;
    return await invokeHikivision('PUT', url, usuario, senha, json, params);
}




async function addUsuarioDevice(id, nome, ip_equipamento, usuario, senha) {
    var json = true;
    var funcao = funcao_add;
    var params = {
        "UserInfo": {
            "employeeNo": "" + id + "",
            "name": "" + nome + "",
            "userType": "normal",
            "Valid": {
                "enable": false,
                "beginTime": "2021-12-01T17:30:08",
                "endTime": "2037-12-31T23:59:59"
            },
            "doorRight": "1",
            "RightPlan": [{
                "doorNo": 1,
                "planTemplateNo": "1"
            }]
        }
    }
    url = "http://" + ip_equipamento + funcao;
    return await invokeHikivision('PUT', url, usuario, senha, json, params);
}



async function invokeHikivision(method, url, usuario, senha, json, params) {
    try{
    return await request({
        'url': url,
        'method': '' + method + '',
        'auth': {
            'user': '' + usuario + '',
            'password': '' + senha + '',
            'sendImmediately': false
        },
        'followRedirect': true,
        'followAllRedirects': true,
        'json': json,
        'body': params
    },
        async function (error, response, body) {
            console.log(error);

            return body; //console.log(response);

        }
    );
    }
    catch(ex){
        console.log(ex);
    }
}

module.exports = { deletarUsuarioDevice,getAllUsers }