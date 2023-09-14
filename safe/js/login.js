function login() {
    var email = document.getElementById("txtEmail").value;
    var senha = document.getElementById("txtSenha").value;
    var params = {
        email: email,
        senha: senha
    }
    getApiAsync("POST", "/login", params, logar);
 
}
function logar(data) {
    console.log(data);
    data = data[0];
    if (data.length <= 0) {
        document.getElementById("dvAlertaMensagem").style.display = "block";
        return;
    }
    else {
        document.getElementById("dvAlertaMensagem").style.display = "none";
        var user = JSON.stringify(data[0]);
        sessionStorage.setItem('usuario', user);
        //alert(data[0].tipo_pessoa);
    }

    location.href = 'index.html';

}
