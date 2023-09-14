var pessoa_global = 0;
var objeto_pessoa = [];
var tipo_pessoa = 0;

if (sessionStorage.getItem("usuario") != null & sessionStorage.getItem("usuario") != undefined) {
    objeto_pessoa = JSON.parse(sessionStorage.getItem("usuario"));
    tipo_pessoa = objeto_pessoa.tipo_usuario;
    Exibir();
    //window.location = "header.html";
} else {
    window.location = "login.html";
}



function Exibir() {
    if (objeto_pessoa.tipo_usuario == 1) {
        document.getElementById("equipamentos-tab").style.display = 'block';
        document.getElementById("pessoas-tab").style.display = 'block';
        document.getElementById("nivel-tab").style.display = 'block';
        document.getElementById("portas-tab").style.display = 'block';
        document.getElementById("acessos-tab").style.display = 'block';
        document.getElementById("logs-tab").style.display = 'block';
        document.getElementById("usuarios-tab").style.display = 'block';
        document.getElementById("btnAcessos").style.display = 'block';
    } else {
        document.getElementById("equipamentos-tab").style.display = 'none';
        document.getElementById("pessoas-tab").style.display = 'none';
        document.getElementById("nivel-tab").style.display = 'none';
        document.getElementById("portas-tab").style.display = 'none';
        document.getElementById("acessos-tab").style.display = 'none';
        document.getElementById("logs-tab").style.display = 'none';
        document.getElementById("usuarios-tab").style.display = 'none';
        document.getElementById("btnAcessos").style.display = 'none';
        document.getElementById("relatorios-tab").click();
    }
}

function getCondominio() {
    var params = "id_condominio=" + id_condominio_geral + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getCondominio', params, preencherCondominio, '');
}
var id_condominio_global;

function preencherCondominio(data) {
    data = data[0][0];
    console.log(data);
    id_condominio_global = data.id;
    document.getElementById("imgCondominio").src = data.imagem_perfil;
    document.getElementById("spCondominio").innerHTML = data.nome;
    document.getElementById("spEndereco").innerHTML = data.endereco_portaria;
    document.getElementById("spCidade").innerHTML = " - " + data.cidade;
    getMoradoresCondominio();
    getEquipamamentosCondominio();
    getModeloEquipamentos();
    getPortasCondominio();
    getHorarios();
    buscarUsuarios(0);
    buscarRelatorios();
    buscarLogs();
}

function getModeloEquipamentos() {
    var params = "id_modelo=0" + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getModeloEquipamentos', params, preencherModelos, '');
}

function preencherModelos(data) {
    data = data[0];
    var html = "<option value=''>Selecione um Modelo</option>";
    for (var i = 0; i < data.length; i++) {
        html += "<option value='" + data[i].modeloid + "'>" + data[i].fabricante + " - " + data[i].nome + "</option>";
    }
    console.log(html);
    document.getElementById("slcModelos").innerHTML = html;
}


function getMoradoresCondominio() {
    var params = "id_condominio=" + id_condominio_global + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getMoradoresCondominio', params, preencherPessoas, '');
}

function preencherPessoas(data) {
    data = data[0];

    console.log(data);

    $('#tblPessoas').DataTable().destroy();
    $('#tblPessoas').DataTable({
        "processing": true,
        "data": data,
        lengthMenu: [
            [15, 50, 100, -1],
            [15, 50, 100, 'Todos'],
        ],
        order: [
            [0, 'asc']
        ],
        "lengthChange": false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
        },
        "columns": [

            { "data": 'nomecompleto' },
            { "data": 'telefone' },
            { "data": 'cpfcnpj' },
            { "data": 'tipo' },
            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Coletar Foto' href='javascript:void(0);' onclick='ColetarFoto(" + oData.pessoaid + ",\"" + oData.nomecompleto + "\"," + oData.tipo_pessoa + ")'><i class='fa fa-camera-retro nav_icon'></i></a></center>");
                }
            },
            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Placa do Veículo' href='javascript:void(0);' onclick='coletarPlaca(" + oData.pessoaid + ",\"" + oData.nomecompleto + "\"," + oData.tipo_pessoa + ")'><i class='fa fa-car nav_icon'></i></a></center>");
                }
            },
            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Enviar para Equipamento' href='javascript:void(0);' onclick='enviarPessoa(" + oData.pessoaid + ",\"" + oData.nomecompleto + "\")'><i class='fa fa-paper-plane-top nav_icon'></i></a></center>");
                }
            },
            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Adicionar Regra de horário' href='javascript:void(0);' onclick='enviarPessoa(" + oData.pessoaid + ",\"" + oData.nomecompleto + "\")'><i class='fa fa-timer  nav_icon'></i></a></center>");
                }
            }
        ]
    });

}





function getPortasCondominio() {
    var params = "id_condominio=" + id_condominio_global + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getPortasCondominio', params, preencherPortas, '');
}
var portas_global;

function preencherPortas(data) {
    data = data[0];
    portas_global = data;
    $('#tblPortas').DataTable().destroy();
    $('#tblPortas').DataTable({
        "processing": true,
        "data": data,
        lengthMenu: [
            [15, 50, 100, -1],
            [15, 50, 100, 'Todos'],
        ],
        order: [
            [0, 'asc']
        ],
        "lengthChange": false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
        },
        "columns": [

            { "data": 'nome' },
            { "data": 'ip' },
            {
                "data": "portaid",
                "portaid": "portaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Abertura Remota' href='javascript:void(0);' onclick='aberturaRemota(\"" + oData.nome + "\",\"" + oData.ip + ":" + oData.porta + "\",\"" + oData.usuario + "\",\"" + oData.senha + "\")'><i class='fa fa-key nav_icon'></i></a></center>");
                }
            },
            {
                "data": "portaid",
                "portaid": "portaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Ver Todos Usuarios' href='javascript:void(0);' onclick='verPessoaEquipamento(\"" + oData.nome + "\",\"" + oData.ip + "\",\"" + oData.usuario + "\",\"" + oData.senha + "\")'><i class='fa fa-users nav_icon'></i></a></center>");
                }
            }
        ]
    });

    var html = "";
    for (var i = 0; i < data.length; i++) {
        html += "<option value=" + data[i].portaid + ">" + data[i].nome + "</option>";
    }
    document.getElementById("slcPortasNivel").innerHTML = html;
    document.getElementById("slcPortasNivelPessoa").innerHTML = html;
    html = "<option value='0'>Todas as Portarias</option>";
    for (var i = 0; i < data.length; i++) {
        html += "<option value=" + data[i].portaid + ">" + data[i].nome + "</option>";
    }
    document.getElementById("slcPortariasRelatorio").innerHTML = html;
}





function getEquipamamentosCondominio() {
    var params = "id_condominio=" + id_condominio_global + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getEquipamentosCondominio', params, preencherEquipamentosCondominio, '');
}

function preencherEquipamentosCondominio(data) {
    data = data[0];


    $('#tblEquipamentos').DataTable().destroy();
    $('#tblEquipamentos').DataTable({
        "processing": true,
        "data": data,
        lengthMenu: [
            [50, 100, 250, -1],
            [50, 100, 250, 'Todos'],
        ],
        order: [
            [0, 'asc']
        ],
        "lengthChange": false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
        },
        "columns": [
            //   { "data": 'id_modelo' },
            { "data": 'ip' },
            { "data": 'porta' }
        ]
    });

    var html = "<option value='0'>Selecione o Equipamento</option>";
    for (var i = 0; i < data.length; i++) {
        html += "<option value='" + data[i].equipamentoid + "'>" + data[i].ip + "</option>";
    }
    document.getElementById("slcEquipamentos").innerHTML = html;


}

function selectRele() {
    if (document.getElementById("slcEquipamentos").value != "0") {
        document.getElementById("slcRele").innerHTML = "<option value='1' selected>Relé 1</option>";
    } else {
        document.getElementById("slcRele").innerHTML = "";
    }
}
var pessoa_escolhida = 0;

function salvarNivelIndividual() {
    var id_horario = document.getElementById("slcHorariosCondominioNivel").value;
    var id_portas = $("#slcPortasNivelPessoa").val();
    var ids_pessoas = [];
    ids_pessoas.push(pessoa_escolhida);
    var params = {
        id_usuario: objeto_pessoa.id_usuario,
        id_horario: id_horario,
        id_portas: '[' + id_portas + ']',
        id_pessoas: '[' + ids_pessoas + ']',
    }
    getApiAsync("POST", '/savePermissao', params, nivelSalvo, '');
}


function salvarNivel() {
    var id_horario = document.getElementById("slcHorariosCondominio").value;
    var id_portas = $("#slcPortasNivel").val();
    var ids_pessoas = [];
    for (var i = 0; i < pessoas_Acesso.length; i++) {
        if (document.getElementById("chkMorador" + pessoas_Acesso[i].pessoaid).checked) {
            ids_pessoas.push(pessoas_Acesso[i].pessoaid);
        }

    }
    var params = {
        id_usuario: objeto_pessoa.id_usuario,
        id_horario: id_horario,
        id_portas: '[' + id_portas + ']',
        id_pessoas: '[' + ids_pessoas + ']',
    }
    getApiAsync("POST", '/savePermissao', params, nivelSalvo, '');
}

function nivelSalvo(data) {

    alert("Nivel de acesso Criado com Sucesso!");
    $("#modalNilvel").modal('hide');
    verAcessos();
}

function salvarPorta() {
    var id_equipamento = document.getElementById("slcEquipamentos").value;
    var id_condominio = id_condominio_global;
    var id_rele = document.getElementById("slcRele").value;
    var nome = document.getElementById("txtNomePorta").value;
    var localizacao = document.getElementById("txtLocalizacaoPorta").value;

    var params = {
        id_usuario: objeto_pessoa.id_usuario,
        id_porta: 0,
        id_equipamento: id_equipamento,
        id_condominio: id_condominio,
        id_rele: id_rele,
        nome: nome,
        localizacao: localizacao
    };

    getApiAsync("POST", '/savePorta', params, portaSalva, '');
}

function portaSalva() {
    getPortasCondominio();
}

function salvarEquipamento() {
    var id_modelo = document.getElementById("slcModelos").value;
    var id_condominio = id_condominio_global;
    var ip = document.getElementById("txtHost").value;
    var porta = document.getElementById("txtPorta").value;
    var usuario = document.getElementById("txtUsuario").value;
    var senha = document.getElementById("txtSenha").value;
    var reles = document.getElementById("txtReles").value;

    var params = {
        id_usuario: objeto_pessoa.id_usuario,
        id_equipamento: 0,
        id_modelo: id_modelo,
        id_condominio: id_condominio,
        ip: ip,
        porta: porta,
        usuario: usuario,
        senha: senha,
        reles: reles
    };

    getApiAsync("POST", '/saveEquipamento', params, EquipamentoSalvo, '');
}

function EquipamentoSalvo(data) {
    console.log("equipamento");
}

function getMoradoresCondominio() {
    var params = "id_condominio=" + id_condominio_global + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getMoradoresCondominio', params, preencherPessoas, '');
}

var pessoas_global = [];

function preencherPessoas(data) {
    console.log("aqui");
    console.log(data);
    data = data[0];

    pessoas_global = data;
    preencharPessoasAcesso();
    $('#tblPessoas').DataTable().destroy();
    $('#tblPessoas').DataTable({
        "processing": true,
        "data": data,
        lengthMenu: [
            [15, 50, 100, -1],
            [15, 50, 100, 'Todos'],
        ],
        order: [
            [0, 'asc']
        ],
        "lengthChange": false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
        },
        "columns": [

            { "data": 'nomecompleto' },
            { "data": 'telefone' },
            { "data": 'cpfcnpj' },
            { "data": 'tipo' },

            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Coletar Foto' href='javascript:void(0);' onclick='ColetarFoto(" + oData.pessoaid + ",\"" + oData.nomecompleto + "\"," + oData.tipo_pessoa + ")'><i class='fa fa-camera-retro nav_icon'></i></a></center>");
                }
            },
            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Placa do Veículo' href='javascript:void(0);' onclick='coletarPlaca(" + oData.pessoaid + ",\"" + oData.nomecompleto + "\"," + oData.tipo_pessoa + ")'><i class='fa fa-car nav_icon'></i></a></center>");
                }
            },

            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Remover Todos os Acessos' href='javascript:void(0);' onclick='removerTodosAcessos(" + oData.pessoaid + ",\"" + oData.nomecompleto + "\")'><i class='fa fa-remove nav_icon'></i></a></center>");
                }
            },

            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    if (oData.facial != null) {
                        var id_pessoa = oData.pessoaid;
                        if (oData.tipo_pessoa == 2) {
                            id_pessoa = "99" + oData.pessoaid;
                        }
                        $(nTd).html("<center><a title='Ver Foto Pessoa' href='javascript:void(0);' onclick='exibirFotoPessoaLocal(\"" + id_pessoa + "\")'><i class='fa fa-face-smile nav_icon'></i></a></center>");
                    } else {
                        $(nTd).html("<center><i style='color:red;' class='fa fa-face-smile nav_icon'></i></center>");
                    }
                }
            },

            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    if (oData.placa != null) {
                        $(nTd).html("<center><a title='Ver Placa Pessoa' href='javascript:void(0);' onclick='verPlaca(\"" + oData.pessoaid + "\")'><i class='fa fa-credit-card nav_icon'></i></a></center>");
                    } else {
                        $(nTd).html("<center><i style='color:red;' class='fa fa-credit-card nav_icon'></i></center>");
                    }
                }
            },
            {
                "data": "pessoaid",
                "pessoaid": "pessoaid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Adicionar Regra de horário' href='javascript:void(0);' onclick='nivelPessoa(" + oData.pessoaid + ",\"" + oData.nomecompleto + "\")'><i class='fa fa-clock nav_icon'></i></a></center>");
                }
            }
        ]
    });


}

function nivelPessoa(id, nome) {
    pessoa_escolhida = id;
    document.getElementById("spPessoaAcesso").innerHTML = nome;
    $("#modalNilvel").modal('show');
}

function removerTodosAcessos(id_pessoa, pessoa) {
    if (window.confirm("TEM CERTEZA QUE DESEJA REMOVER TODOS OS ACESSOS DE " + pessoa)) {
        var params = { id_permissao: 0, id_pessoa: id_pessoa, id_usuario: objeto_pessoa.id_usuario };
        getApiAsync("POST", '/removerPermissao', params, AcessoRemovido, id_pessoa);
    }
}

function AcessoRemovido(data, id_pessoa) {
    console.log(data);
    var params = "id_pessoa=" + id_pessoa + "&id_condominio=" + id_condominio_global;
    getApiAsync("GET", '/deletarUsuarioTodosEquipamentos', params, exclusaoEquipamento, '');
    alert("Acessos Removido");
}
function exclusaoEquipamento(data) {
    console.log(data);
}

var pessoas_Acesso = [];

function preencharPessoasAcesso() {

    var data = [];
    for (var i = 0; i < pessoas_global.length; i++) {
        if (pessoas_global[i].facial != null) {

            data.push(pessoas_global[i]);
        }
    }
    pessoas_Acesso = data;
    $('#tblPessoasAcesso').DataTable().destroy();
    $('#tblPessoasAcesso').DataTable({
        "processing": true,
        "filter": true,
        "data": data,
        paginate: false,
        order: [
            [1, 'asc']
        ],
        "lengthChange": false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
        },
        "columns": [{
            "data": "pessoaid",
            "pessoaid": "pessoaid",
            orderable: false,
            fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                $(nTd).html("<center><input type='checkbox' class='chkAcessos' value='" + oData.pessoaid + "' id='chkMorador" + oData.pessoaid + "'> </center>");
            }
        },
        { "data": 'nomecompleto' },
        { "data": 'telefone' },
        { "data": 'cpfcnpj' },
        { "data": 'tipo' },


        ]
    });
}
var tipo_pessoa_edit = 0;

function ColetarFoto(id_pessoa, nome, tipo_pessoa) {
    loadCamera();
    foto_global = "";
    foto_upload = "";
    tipo_pessoa_edit = tipo_pessoa;
    id_pessoa_edicao = id_pessoa;
    document.getElementById("spNomeFacial").innerHTML = nome;
    document.getElementById('previewImage').style.display = "none";
    document.getElementById('webCamera').style.display = "block";
    $("#modalFoto").modal('show');
}

function coletarPlaca(id_pessoa, nome) {
    tipo_pessoa_edit = tipo_pessoa;
    id_pessoa_edicao = id_pessoa;
    document.getElementById("spNomePlaca").innerHTML = nome;
    $("#modalPlaca").modal('show');
}


function verPlaca(pessoa) {
    var params = "id_pessoa=" + pessoa + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getPlacasPessoa', params, ExibirPlacas, '');

}

function removerPlaca(id, placa, id_pessoa) {
    if (window.confirm("Tem certeza que deseja remover a placa " + placa + " do sistema?")) {
        var params = {
            id_biometria: id,
            id_usuario: objeto_pessoa.id_usuario
        }
        getApiAsync("POST", '/deletePlacaPessoa', params, placaRemovida, id_pessoa);
    }
}

function placaRemovida(data, id_pessoa) {
    verPlaca(id_pessoa);
}

function ExibirPlacas(data) {
    console.log(data);
    data = data[0];
    var html = "";
    for (var i = 0; i < data.length; i++) {
        html += "<div class='row'>";
        html += "<div class='col-sm-2'></div>";
        html += "<div class='col-sm-4'><h4>" + data[i].valor + "</h4></div>";
        html += "<div class='col-sm-1'><a href='javascript:void(0);' onclick='removerPlaca(" + data[i].biometriaid + ",\"" + data[i].valor + "\"," + data[i].id_pessoa + ")' style='color:red;font-size:25px;'><i class='fa fa-remove'></i></a></div>";
        html += "</div>";
    }
    document.getElementById("dvConteudoVisualizacao").innerHTML = html;
    $("#modalVisualizacao").modal('show');
}
function exibirFotoPessoaLocal(id_pessoa) {
    document.getElementById("dvConteudoVisualizacao").innerHTML = "<center> <img width='100%' src='" + urlApi + "/images/" + id_pessoa + ".jpg' /></center>";
    $("#modalVisualizacao").modal('show');
}

function verFoto(pessoa) {
    var params = "id_pessoa=" + pessoa + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getFotoPessoa', params, exibirPessoa, '');

}

function exibirPessoa(data) {
    console.log(data);
    data = data[0];
    document.getElementById("dvConteudoVisualizacao").innerHTML = "<center> <img width='100%' src='data:image/png;base64," + data[0].valor + "' /></center>";
    $("#modalVisualizacao").modal('show');
}

function salvarFoto() {
    if (foto_global == "" && foto_upload == "") {
        return alert("É necessário tirar uma foto do rosto ou realizar o upload para prosseguir!");
    }
    var id_biometria = 98;
    var params = {
        id_pessoa: id_pessoa_edicao,
        id_biometria: id_biometria,
        valor: (foto_global != "" ? foto_global : foto_upload),
        coacao: 0,
        id_usuario: objeto_pessoa.id_usuario,
        tipo_pessoa: tipo_pessoa_edit
    };

    getApiAsync("POST", '/saveBiometria', params, BiometriaSalva, '');
}

function salvarPlaca() {
    var placa = document.getElementById("txtPlaca").value;
    var id_biometria = 99;
    var params = {
        id_pessoa: id_pessoa_edicao,
        id_biometria: id_biometria,
        valor: placa,
        coacao: 0,
        id_usuario: objeto_pessoa.id_usuario,
        tipo_pessoa: tipo_pessoa_edit
    };

    getApiAsync("POST", '/saveBiometria', params, BiometriaSalva, '');
}

function BiometriaSalva() {
    document.getElementById("txtPlaca").value = "";
    foto_global = "";
    getMoradoresCondominio();
    $("#modalPlaca").modal('hide');
    $("#modalFoto").modal('hide');
}



function salvarHorario() {

    var nome = document.getElementById("txtNomeHorario").value;
    var descricao = document.getElementById("txtDescricaoHorario").value;
    var iniciodomingo = document.getElementById("txtInicioDomingo").value;
    var finaldomingo = document.getElementById("txtFinalDomingo").value;
    var iniciosegunda = document.getElementById("txtInicioSegunda").value;
    var finalsegunda = document.getElementById("txtFinalSegunda").value;
    var inicioterca = document.getElementById("txtInicioTerca").value;
    var finalterca = document.getElementById("txtFinalTerca").value;
    var inicioquarta = document.getElementById("txtInicioQuarta").value;
    var finalquarta = document.getElementById("txtFinalQuarta").value;
    var inicioquinta = document.getElementById("txtInicioQuinta").value;
    var finalquinta = document.getElementById("txtFinalQuinta").value;
    var iniciosexta = document.getElementById("txtInicioSexta").value;
    var finalsexta = document.getElementById("txtFinalSexta").value;
    var iniciosabado = document.getElementById("txtInicioSabado").value;
    var finalsabado = document.getElementById("txtFinalSabado").value;

    var params = {
        id_horario: id_horario_global,
        id_condominio: id_condominio_global,
        nome: nome,
        descricao: descricao,
        iniciodomingo: iniciodomingo,
        finaldomingo: finaldomingo,
        iniciosegunda: iniciosegunda,
        finalsegunda: finalsegunda,
        inicioterca: inicioterca,
        finalterca: finalterca,
        inicioquarta: inicioquarta,
        finalquarta: finalquarta,
        inicioquinta: inicioquinta,
        finalquinta: finalquinta,
        iniciosexta: iniciosexta,
        finalsexta: finalsexta,
        iniciosabado: iniciosabado,
        finalsabado: finalsabado,
        id_usuario: objeto_pessoa.id_usuario
    };

    getApiAsync("POST", '/saveHorario', params, HorarioSalvo, '');
}

function HorarioSalvo(data) {
    getHorarios();
    id_horario_global = 0;
}

function sempreLiberar() {

    if (document.getElementById("chkSempreLiberado").checked) {
        document.getElementById("txtInicioDomingo").value = "00:00";
        document.getElementById("txtFinalDomingo").value = "23:59";
        document.getElementById("txtInicioSegunda").value = "00:00";
        document.getElementById("txtFinalSegunda").value = "23:59";
        document.getElementById("txtInicioTerca").value = "00:00";
        document.getElementById("txtFinalTerca").value = "23:59";
        document.getElementById("txtInicioQuarta").value = "00:00";
        document.getElementById("txtFinalQuarta").value = "23:59";
        document.getElementById("txtInicioQuinta").value = "00:00";
        document.getElementById("txtFinalQuinta").value = "23:59";
        document.getElementById("txtInicioSexta").value = "00:00";
        document.getElementById("txtFinalSexta").value = "23:59";
        document.getElementById("txtInicioSabado").value = "00:00";
        document.getElementById("txtFinalSabado").value = "23:59";
    } else {
        document.getElementById("txtInicioDomingo").value = "";
        document.getElementById("txtFinalDomingo").value = "";
        document.getElementById("txtInicioSegunda").value = "";
        document.getElementById("txtFinalSegunda").value = "";
        document.getElementById("txtInicioTerca").value = "";
        document.getElementById("txtFinalTerca").value = "";
        document.getElementById("txtInicioQuarta").value = "";
        document.getElementById("txtFinalQuarta").value = "";
        document.getElementById("txtInicioQuinta").value = "";
        document.getElementById("txtFinalQuinta").value = "";
        document.getElementById("txtInicioSexta").value = "";
        document.getElementById("txtFinalSexta").value = "";
        document.getElementById("txtInicioSabado").value = "";
        document.getElementById("txtFinalSabado").value = "";
    }

}






function getHorarios() {
    var params = "id_condominio=" + id_condominio_global + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getHorario', params, preencherHorario, '');
}

function preencherHorario(data) {
    data = data[0];
    console.log(data);
    $('#tblHorarios').DataTable().destroy();
    $('#tblHorarios').DataTable({
        "processing": true,
        "data": data,
        lengthMenu: [
            [15, 50, 100, -1],
            [15, 50, 100, 'Todos'],
        ],
        order: [
            [0, 'asc']
        ],
        "lengthChange": false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
        },
        "columns": [

            { "data": 'nome' },
            {
                "data": "horarioid",
                "horarioid": "horarioid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Visualizar Horário' href='javascript:void(0);' onclick='getOneHorario(" + oData.horarioid + ")'><i class='fa fa-eye nav_icon'></i></a></center>");
                }
            },
            {
                "data": "horarioid",
                "horarioid": "horarioid",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Remover Horário' href='javascript:void(0);' onclick='deletarHorario(" + oData.horarioid + ")'style='color:red!important;' ><i class='fa fa-remove nav_icon'></i></a></center>");
                }
            }
        ]
    });

    var html = "<option value='0'>Selecione um horário</>";
    if (data != null && data != undefined) {
        for (var i = 0; i < data.length; i++) {
            html += "<option value='" + data[i].horarioid + "'>" + data[i].nome + "</option>";
        }
    }
    document.getElementById("slcHorariosCondominio").innerHTML = html;
    document.getElementById("slcHorariosCondominioNivel").innerHTML = html;



}




function getOneHorario(id_horario) {
    var params = "id_horario=" + id_horario + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getHorarioDetalhes', params, PreencherUmHorario, '');
}
var id_horario_global = 0;

function PreencherUmHorario(data) {
    data = data[0];
    console.log(data);
    for (var i = 0; i < data.length; i++) {
        switch (data[i].id_dia) {
            case 1:
                {
                    id_horario_global = data[i].id_horario;
                    document.getElementById("txtNomeHorario").value = data[i].nome;
                    document.getElementById("txtDescricaoHorario").value = data[i].descricao;
                    document.getElementById("txtInicioDomingo").value = data[i].inicio;
                    document.getElementById("txtFinalDomingo").value = data[i].fim;
                    break;
                }
            case 2:
                {
                    document.getElementById("txtInicioSegunda").value = data[i].inicio;
                    document.getElementById("txtFinalSegunda").value = data[i].fim;
                    break;
                }
            case 3:
                {
                    document.getElementById("txtInicioTerca").value = data[i].inicio;
                    document.getElementById("txtFinalTerca").value = data[i].fim;
                    break;
                }
            case 4:
                {
                    document.getElementById("txtInicioQuarta").value = data[i].inicio;
                    document.getElementById("txtFinalQuarta").value = data[i].fim;
                    break;
                }
            case 5:
                {
                    document.getElementById("txtInicioQuinta").value = data[i].inicio;
                    document.getElementById("txtFinalQuinta").value = data[i].fim;
                    break;
                }
            case 6:
                {
                    document.getElementById("txtInicioSexta").value = data[i].inicio;
                    document.getElementById("txtFinalSexta").value = data[i].fim;
                    break;
                }
            case 7:
                {
                    document.getElementById("txtInicioSabado").value = data[i].inicio;
                    document.getElementById("txtFinalSabado").value = data[i].fim;
                    break;
                }

        }

    }


}

function checkAllPessoas() {
    $('input[type="checkbox"]').not('#chkTodos').each(function () {
        var checked = $(this).is(':checked');
        checked ? $(this).prop('checked', false) : $(this).prop('checked', true);
    });

}




function buscarUsuarios(id) {
    var params = "id_condominio=" + id_condominio_global + "&id_usuario=" + objeto_pessoa.id_usuario + "&id_usuario_edit=" + id;
    getApiAsync("GET", '/buscarUsuarios', params, preencherUsuarios, id);
}

function preencherUsuarios(data, id) {
    data = data[0];
    if (id == 0) {
        $('#tblUsuarios').DataTable().destroy();
        $('#tblUsuarios').DataTable({
            "processing": true,
            "data": data,
            lengthMenu: [
                [15, 50, 100, -1],
                [15, 50, 100, 'Todos'],
            ],
            order: [
                [0, 'asc']
            ],
            "lengthChange": false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
            },
            "columns": [
                { "data": 'id_usuario' },
                { "data": 'email' },
                { "data": 'id_pessoa' },
                {
                    "data": "id_usuario",
                    "id_usuario": "id_usuario",
                    fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                        $(nTd).html("<center><a title='Editar Usuário' href='javascript:void(0);' onclick='editarUsuario(" + oData.id_usuario + ")'><i class='fa fa-pen-to-square nav_icon'></i></a></center>");
                    }
                },
                {
                    "data": "id_usuario",
                    "id_usuario": "id_usuario",
                    fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                        $(nTd).html("<center><a title='Remover Usuário' href='javascript:void(0);' onclick='removerUsuario(" + oData.id_usuario + ")'><i class='fa fa-remove nav_icon'></i></a></center>");
                    }
                }
            ]
        });
    }

}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Evento disparado ao selecionar uma foto
document.getElementById('upFoto').addEventListener('change', async function (event) {
    const file = event.target.files[0];
    try {
        const base64Image = await convertToBase64(file);
        document.getElementById('webCamera').style.display = "none";
        document.getElementById('previewImage').style.display = "block";
        document.getElementById('previewImage').src = base64Image;
        foto_upload = base64Image.split(',')[1];

    } catch (error) {
        console.error(error);
    }
});