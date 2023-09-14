
function aberturaRemota(nomePorta,ipdev,usuariodev,senhadev)
{
   if(window.confirm("Tem certeza que deseja abrir a porta "+ nomePorta+" ?"))
   {
    var metodo = "aberturaRemota";
    var type = 'PUT';
    postHiki(ipdev,usuariodev,senhadev,metodo,type);
   }
}



function verPessoaEquipamento(nomePorta,ipdev,usuariodev,senhadev)
{
    var metodo = "GetAllUsuariosDevice";
    var type = 'POST';
    postHiki(ipdev,usuariodev,senhadev,metodo,type,nomePorta);
   
}


function adicionarUsuario(ipdev,usuariodev,senhadev)
{
    var metodo = "addUser";
    var type = 'PUT';
    postHiki(ipdev,usuariodev,senhadev,metodo,type,'');
   
}

function addFaceUser(ipdev,usuariodev,senhadev)
{
    var metodo = "addFaceUser";
    var type = 'POST';
    postHiki(ipdev,usuariodev,senhadev,metodo,type,'');
   
}




function postHiki(ipdev,usuariodev,senhadev,metodo,type,nomePorta) {   
    var params = {
        ip_equipamento: ipdev,
        usuario: usuariodev,
        senha: senhadev,
        metodo: metodo,
        type:type
    }
    getApiAsync("POST", '/postHiki', params, retornoHiki, metodo,nomePorta);
}

function retornoHiki(data,metodo) {
    console.log(data);
}


function foto()
{
var fileInput = document.getElementById("fileinput");

var form = new FormData();
form.append("FaceDataRecord", "{\"faceLibType\":\"blackFD\",\"FDID\":\"1\",\"FPID\":\"25\"}");
form.append("FaceImage", fileInput.files[0], "C:/SafeHouse/Nuvem/safe_back/images/25.png");

$.ajaxDigest('http://192.168.1.148/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json', {
    username: 'admin',
    password: 'anjos6567',
    "method": "POST",
  "timeout": 0,
  "processData": false,
  "mimeType": "multipart/form-data",
  "contentType": false,
  "data": form
}).done(function(data, textStatus, jqXHR) {
    alert('Retrieved data!');
    console.log(data);
}).fail(function(jqXHR, textStatus, errorThrown) {
    alert('Request failed :(');
});


/*
var settings = {
  "url": "http://192.168.1.148/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json",
  "method": "POST",
  "timeout": 0,
  "processData": false,
  "mimeType": "multipart/form-data",
  "contentType": false,
  "data": form
};

$.ajax(settings).done(function (response) {
  console.log(response);
});
*/
}