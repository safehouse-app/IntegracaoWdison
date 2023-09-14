var id_condominio_geral = 43;
//var urlApi = "http://127.0.0.1:3004";
var urlApi = "https://safehouseportariavirtual.com.br:3004";
var url_cameras = "http://20.226.89.150:1984/stream.html?src=";
//var urlApi = "http://spasafehouse.ddns.net:8085";


function logoff() {
    sessionStorage.removeItem("usuario");
    window.location = "login.html";
}
$(document).ready(function () {
    $('.date').mask('00/00/0000');
    $('.time').mask('00:00:00');
    $('.date_time').mask('00/00/0000 00:00:00');
    $('.cep').mask('00000-000');
    $('.phone').mask('0000-0000');
    $('.phone_with_ddd').mask('(00) 0000-0000');
    $('.phone_us').mask('(000) 000-0000');
    $('.mixed').mask('AAA 000-S0S');
    $('.cpf').mask('000.000.000-00', { reverse: true });
    $('.cnpj').mask('00.000.000/0000-00', { reverse: true });
    $('.money').mask('000.000.000.000.000,00', { reverse: true });
    $('.money2').mask("#.##0,00", { reverse: true });
    $('.ip_address').mask('0ZZ.0ZZ.0ZZ.0ZZ', {
        translation: {
            'Z': {
                pattern: /[0-9]/,
                optional: true
            }
        }
    });
    $('.ip_address').mask('099.099.099.099');
    $('.percent').mask('##0,00%', { reverse: true });
    $('.clear-if-not-match').mask("00/00/0000", { clearIfNotMatch: true });
    $('.placeholder').mask("00/00/0000", { placeholder: "__/__/____" });
    $('.fallback').mask("00r00r0000", {
        translation: {
            'r': {
                pattern: /[\/]/,
                fallback: '/'
            },
            placeholder: "__/__/____"
        }
    });
    $('.selectonfocus').mask("00/00/0000", { selectOnFocus: true });
});





function getApiAsync(type, metodo, params, callback, param, param2) {
    var retorno = "";
    //console.log(urlApi + metodo + params);
    //loading();
    if (type == "POST") {
        $.ajax({
            type: type,
            contentType: "application/json",
            url: urlApi + metodo,
            dataType: 'json',
            data: JSON.stringify(params),
            crossDomain: true,
            async: true,
            success: function (data) {
                callback(data, param, param2);
                // unloading();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                //    alert(xhr.status);
                //   alert(thrownError);
                // unloading();
            },
            beforeSend: function () {
                //  loading();
            }
        });
    } else {
        $.ajax({
            type: type,
            headers: {
                'Content-Type': 'application/json'
            },
            url: urlApi + metodo + "?" + params,
            dataType: 'json',
            //  data:params,
            crossDomain: true,
            async: true,
            success: function (data) {
                callback(data, param, param2);
                //   unloading();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                // alert(xhr.status);
                //   alert(thrownError);
                //  unloading();
            },
            beforeSend: function () {
                //loading();
            }
        });
    }
    return retorno;
}


function loadCamera() {
    //Captura elemento de vídeo
    var video = document.querySelector("#webCamera");
    //As opções abaixo são necessárias para o funcionamento correto no iOS
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    //--400

    //Verifica se o navegador pode capturar mídia
    if (navigator.mediaDevices != undefined) {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                audio: false, video: {
                    facingMode: 'user'

                }
            })
                .then(function (stream) {
                    //Definir o elemento vídeo a carregar o capturado pela webcam
                    video.srcObject = stream;
                })
                .catch(function (error) {
                    // alert("Oooopps... Falhou :'(");
                });
        }
    }
}

let videoStream;
let cropper;

function takeSnapShot() {
    //Captura elemento de vídeo
    var video = document.querySelector("#webCamera");

    //Criando um canvas que vai guardar a imagem temporariamente
    var canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext('2d');

    //Desenhando e convertendo as dimensões
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    //Criando o JPG
    var dataURI = canvas.toDataURL('image/jpeg'); //O resultado é um BASE64 de uma imagem.

    sendSnapShot(dataURI); //Gerar Imagem e Salvar Caminho no Banco
}

var foto_global = "";
var foto_upload = "";
function sendSnapShot(base64) {
    document.getElementById('webCamera').style.display = "none";;
    const img = document.getElementById('croppedImage');
    img.src = base64;
    img.style.display = 'block';

    // Exibir o botão de finalizar crop
    document.getElementById('cropBtn').style.display = 'block';

    cropper = new Cropper(img, {
        aspectRatio: NaN,
        viewMode: 1,
        dragMode: 'crop',
        responsive: true,
    });
}

function finishCrop() {

    // Obter a imagem recortada
    const croppedCanvas = cropper.getCroppedCanvas();
    const croppedImageData = croppedCanvas.toDataURL('image/png');

    // Exibir a imagem recortada abaixo do vídeo
    // const resultImage = document.getElementById('resultImage');
    // resultImage.src = croppedImageData;
  
    document.getElementById('croppedImage').style.display = 'none';
    document.getElementById('cropBtn').style.display = 'none';
    cropper.destroy();

    document.getElementById('previewImage').src = croppedImageData;
    document.getElementById('previewImage').style.display = 'block';
    foto_global = croppedImageData.split(',')[1];
    //  document.getElementById('result').style.display = 'none';
}



const today = new Date();

function formatDate() {

    return today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
}


window.setInterval(buscarAcessosNotificacao, 3000);

function buscarAcessosNotificacao() {
    var params = "id_condominio=" + id_condominio_geral;
    getApiAsync("GET", '/getAcessosNotificacao', params, not, '');
}

function not(data) {
    console.log("aqui");
    console.log(data);
    data = data[0];

    var html_notificacao = "";
    for (var i = 0; i < data.length; i++) {
        if (data[i].notificado == 0) {
            var date = data[i].data;
            html_notificacao += "        <div class='toast-header'>";
            html_notificacao += "      <strong class='me-auto'>";
            html_notificacao += "          " + data[i].nome;

            html_notificacao += "        </strong>";

            html_notificacao += "                <button type='button' class='btn-close' data-bs-dismiss='toast'>";
            html_notificacao += "        </button>";
            html_notificacao += "    </div>";
            html_notificacao += "    <div class='toast-body'>";
            html_notificacao += "           <center> <b>" + date;
            if (data[i].pessoaid != 0) {
                html_notificacao += "     <br> <img src='" + urlApi + "/images/" + data[i].pessoaid + ".jpg' class='img-thumbnail rounded me-2' width='100px' alt=''></center><br>";
            }
            html_notificacao += "        <p> <center><b>";
            html_notificacao += data[i].nomecompleto + " | " + data[i].bloco + " " + data[i].complemento;

            html_notificacao += "        </p> <center></b>";
            html_notificacao += "    </div>";
            informarNotificado(data[i].id_acesso);
        }
    }
    if (html_notificacao != "") {
        document.getElementById("dvNotificacaoPush").innerHTML = html_notificacao;
        notificar();
    }

}