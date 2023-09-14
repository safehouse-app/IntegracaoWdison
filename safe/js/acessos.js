function verAcessos() {
    var params = "id_condominio=" + id_condominio_global + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/getRegras', params, preencherRegras, '');

}
var regras_acessos_global;

function preencherRegras(data) {
    data = data[0];
    regras_acessos_global = data;
    var porta_atual = "";
    var html_portas = "";
    var html_pessoas = "";
    for (var i = 0; i < data.length; i++) {
        if (porta_atual != data[i].nome) {
            html_portas += "<div class='col-lg-12' onclick='getPessoasAcesso(" + data[i].id_porta + ")'><a href='javascript:void(0)'><i class='fa fa-door-closed'></i> " + data[i].nome + "</a></div><br><br>";
        }
        // html_pessoas+="<div class='col-lg-12' onclick='getPessoas("+data[i].id_porta+")'><a href='javascript:void(0)'>"+data[i].nomecompleto+"</a></div>";

        porta_atual = data[i].nome;
    }
    document.getElementById("dvPortasAcesso").innerHTML = html_portas;
    //document.getElementById("dvPessoasAcesso").innerHTML = html_pessoas;
    tabelaAcessos(data);

}

function getPessoasAcesso(id_porta) {
    var data = [];
    //Buscar Pessoas que estao no equipamento agora//
    var params = "maxresult=1000&position=0&id_porta=" + id_porta;
    getApiAsync("GET", '/getAllUsuariosDevice', params, preencherUsuariosDevice, id_porta);

    /*
    for (var i = 0; i < regras_acessos_global.length; i++) {
        if (regras_acessos_global[i].id_porta == id_porta) {
            data.push(regras_acessos_global[i]);
        }
    }
    tabelaAcessos(data);
    */
}

function preencherUsuariosDevice(data, id_porta) {
    // data = data[0];
    console.log(data);
    var result = [];
    for (var i = 0; i < regras_acessos_global.length; i++) {
        if (regras_acessos_global[i].id_porta == id_porta) {
            var face = 0;
            var tem_device = 0;
            for (var j = 0; j < data.length; j++) {
                if (data[j].employeeNo == regras_acessos_global[i].pessoaid) {
                    face = data[j].numOfFace;
                    tem_device = 1;
                }
            }
            regras_acessos_global[i].tem_device = tem_device;
            regras_acessos_global[i].face = face;
            result.push(regras_acessos_global[i]);
        }
    }
    tabelaAcessos(result);


}


function tabelaAcessos(data) {
    console.log(data);
    $('#tblPessoasAcessoRegra').DataTable().destroy();
    $('#tblPessoasAcessoRegra').DataTable({
        "processing": true,
        "filter": true,
        "data": data,
        paginate: true,
        order: [
            [1, 'asc']
        ],
        "lengthChange": false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
        },
        "columns": [
            {
                "data": "tem_device",
                "tem_device": "tem_device",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    var html = "<i class='fa fa-check' style='color:green;'></i>";
                    if (oData.tem_device == 0) {
                        html = "<i class='fa fa-xmark' style='color:red;'></i>";
                    }
                    $(nTd).html("<center>" + html + "</center>");
                }
            },
            {
                "data": "face",
                "face": "face",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    var html = "<i class='fa fa-check' style='color:green;'></i>";
                    if (oData.face == 0) {
                        html = "<i class='fa fa-xmark' style='color:red;'></i>";
                    }
                    $(nTd).html("<center>" + html + "</center>");
                }
            },


            { "data": 'nomecompleto' },
            { "data": 'nome' },
            { "data": 'regra' },
            {
                "data": "id_permissao",
                "id_permissao": "id_permissao",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    $(nTd).html("<center><a title='Remover Acesso' href='javascript:void(0);' onclick='removerAcesso(" + oData.id_permissao + ",\"" + oData.nome + "\",\"" + oData.nomecompleto + "\")'><i class='fa fa-minus nav_icon'></i></a></center>");
                }
            }

        ]
    });
    $("#modalAcessos").modal('show');
}

function removerAcesso(id_permissao, porta, pessoa) {
    if (window.confirm("TEM CERTEZA QUE DESEJA REMOVER O ACESSO DE " + pessoa + " PARA A PORTA " + porta + "?")) {
        var params = { id_permissao: id_permissao, id_pessoa: 0 };
        getApiAsync("POST", '/removerPermissao', params, verAcessos, '');
    }
}

function sincronizarTudo() {
    var params = "id_condominio=" + id_condominio_global + "&id_usuario=" + objeto_pessoa.id_usuario;
    getApiAsync("GET", '/syncAllPlacas', params, placas, '');
    getApiAsync("GET", '/syncAllUsers', params, resultado, '');
    alert("Sincronização iniciada!");
    $("#modalAcessos").modal('hide');
}

function deletarHorario(id_horario) {
    if (window.confirm("Tem certeza que deseja remover o horário selecionado? esta ação irá remover todos os níveis de acesso cadastrado para esse horário, e é irreversível.")) {
        var params = { id_horario: id_horario, id_usuario: objeto_pessoa.id_usuario };
        getApiAsync("POST", '/deleteHorario', params, HorarioSalvo, '');
    }
}

function placas(data) {
    console.log('ok');

}

function resultado() {
    alert("Sincronização iniciada!");
}



function buscarRelatorios() {
    const porta = document.getElementById("slcPortariasRelatorio").value;
    const inicio = document.getElementById("txtDataInicio").value;
    const final = document.getElementById("txtDataFinal").value;
    const hora_inicio = document.getElementById("txtHoraInicio").value.trim();
    const hora_fiinal = document.getElementById("txtHoraFinal").value.trim();
    var params = "id_condominio=" + id_condominio_global +
        "&id_usuario=" + objeto_pessoa.id_usuario +
        "&porta=" + porta +
        "&inicio=" + inicio.trim() + ' ' + hora_inicio +
        "&final=" + final.trim() + ' ' + hora_fiinal;
    console.log(params);
    getApiAsync("GET", '/getRelatorioAcessos', params, preencherAcessos, '');

}

function preencherAcessos(data) {
    data = data[0];
    console.log(data);
    $('#tblRelatoriosAcesso').DataTable().destroy();
    $('#tblRelatoriosAcesso').DataTable({
        "processing": true,
        "filter": true,
        "data": data,
        paginate: true,
        order: [
            [0, 'desc']
        ],
        dom: 'Bfrtip',
        buttons: [
            //  'copyHtml5',
            'excelHtml5',
            //   'csvHtml5',
            'pdfHtml5'
        ],
        "lengthChange": false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
        },
        "columns": [
            //
            {
                "data": "data",
                "data": "data",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    // var date = new Date(oData.data);
                    $(nTd).html(oData.data);
                }
            },
            { "data": 'nome' },
            { "data": 'tipo' },
            { "data": 'nomecompleto' },
            { "data": 'bloco' },
            { "data": 'complemento' }
        ]
    });

}

function maximizar(div) {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        $('#' + div).get(0).requestFullscreen();
    }
}

function realTime() {
    var html = "";
    var j = 0;
    for (var i = 0; i < portas_global.length; i++) {
        html += "        <div class='col-lg-6'>";
        html += "         <center>  <b><i class='fa fa-key'></i> " + portas_global[i].nome + "</b>  </center>   ";
        html += "        <hr>";

        html += "         <div class='row' style='font-size:13px;' > ";
        html += "         <div class='col-lg-4'><b>IP LOCAL:</b> <a target='_blank' href='http://" + portas_global[i].ip_local + "'>" + portas_global[i].ip_local + "</a></div> ";
        html += "         <div class='col-lg-7'><b>IP NUVEM:</b>  <a target='_blank' href='http://" + portas_global[i].ip + ":" + portas_global[i].porta + "'>" + portas_global[i].ip + ":" + portas_global[i].porta + "</a></div> ";
        html += "          <div class='col-lg-1'><a title='Abertura Remota' href='javascript:void(0);' onclick='aberturaRemota(\"" + portas_global[i].nome + "\",\"" + portas_global[i].ip + ":" + portas_global[i].porta + "\",\"" + portas_global[i].usuario + "\",\"" + portas_global[i].senha + "\")'><i class='fa fa-key nav_icon'></i> </a></div>";

        html += "         </div> ";
        html += "        <hr>";
        html += "        <div class='row'>";

        /* exibir o video*/
        html += "<iframe  style='heigth:'300px' src='" + url_cameras + portas_global[i].id_equipamento + "'></iframe>"
        /*  if (portas_global[i].id_modelo == 2) {
              html += "     <center>   <img width='50%' src= 'http://192.168.1.170:30000/'> </center>";
          }
          */
        //   html += "        <div class='col-lg-4'>";
        //   html += "     <center>   <img width='50%' src='https://www.igmschool.com.br:30006/'> </center>";
        //    html += "    </div>";
        html += "        <div class='col-lg-12'>";
        html += "        <table id='tblReal" + portas_global[i].portaid + "'  class='table table-bordered dt-responsive nowrap table-striped align-middle' style='width:100%;font-size:11px;'>";
        html += "            <thead>";
        html += "                <th>Data</th>";
        html += "                <th>Acesso</th>";
        html += "            </thead>";
        html += "            <tbody>";
        html += "            </tbody>";
        html += "        </table>";
        html += "    </div>";
        html += "    </div>";
        html += "    </div>";

        if (j == 1) {
            html += "    <hr>";
            j = -1;
        }
        j++;

    }
    document.getElementById("dvRealTIme").innerHTML = html;
    preencherRealTime(0);
    window.setInterval(preencherRealTime, 5000);

}
var real = [];

function preencherRealTime(clica) {
    if (clica == 0) {
        real = [];
    }
    for (var i = 0; i < portas_global.length; i++) {
        var params = "id_condominio=" + id_condominio_global + "&id_usuario=" + objeto_pessoa.id_usuario +
            "&porta=" + portas_global[i].portaid;
        getApiAsync("GET", '/getRealTime', params, preencherAcessosRealTime, portas_global[i].portaid, i);
    }
    // window.setInterval(notificar, 6000);
}
var contador = 0;
function preencherAcessosRealTime(data, id, index) {
    data = data[0];
    var igual = 0;
    if (real.length < portas_global.length) {
        real.push(data);
    } else {
        if (data[0] == undefined || data[0] == null || real[index].length == 0 || data.length == 0) {
            igual = 1;
        } else {
            if (data[0].data == real[index][0].data) {
                igual = 1;
            } else {
                igual = 0;
                real[index] = data[0];
            }
        }

    }
    if (igual == 0) {

        $('#tblReal' + id + '').DataTable().destroy();
        $('#tblReal' + id + '').DataTable({
            "processing": true,
            "filter": false,
            "data": data,
            paginate: false,
            order: [
                [0, 'desc']
            ],
            "info": false,
            "lengthChange": false,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
            },
            "columns": [
                //
                {
                    "data": "data",
                    "data": "data",
                    fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                        // var date = new Date(oData.data);
                        $(nTd).html(oData.data);
                    }
                },
                {
                    "data": "data",
                    "data": "data",
                    fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                        $(nTd).html(oData.nomecompleto + ' | ' + oData.bloco + ' - ' + oData.complemento);
                    }
                }
            ]
        });
        if (real.length == portas_global.length) {

        }
        console.log('diferente');
    } else {

        console.log('igual');
    }
}

function informarNotificado(id_acesso) {
    var params = "id_acesso=" + id_acesso;
    getApiAsync("GET", '/informarNotificado', params, notificado, '');
}
function notificado(data) {
    console.log(data);
}

function buscarLogs() {
    const inicio = document.getElementById("txtDataInicioLogs").value;
    const final = document.getElementById("txtDataFinalLogs").value;
    const hora_inicio = document.getElementById("txtHoraInicioLogs").value.trim();
    const hora_fiinal = document.getElementById("txtHoraFinalLogs").value.trim();
    var params = "id_usuario=" + objeto_pessoa.id_usuario +
        "&id_condominio=" + id_condominio_global +
        "&inicio=" + inicio.trim() + ' ' + hora_inicio +
        "&final=" + final.trim() + ' ' + hora_fiinal;
    getApiAsync("GET", '/buscarLogs', params, preencherLogs, '');
}

function preencherLogs(data) {
    data = data[0];
    console.log(data);
    $('#tblRelatorioLogs').DataTable().destroy();
    $('#tblRelatorioLogs').DataTable({
        "processing": true,
        "filter": true,
        "data": data,
        paginate: true,
        order: [
            [0, 'desc']
        ],
        dom: 'Bfrtip',
        buttons: [
            'excelHtml5',
            'pdfHtml5'
        ],
        "lengthChange": false,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.11.4/i18n/pt_br.json'
        },
        "columns": [
            //
            {
                "data": "data",
                "data": "data",
                fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
                    var date = new Date(oData.data);

                    $(nTd).html(date.toLocaleDateString() + ' às ' + date.toLocaleTimeString());
                }
            },
            { "data": 'email' },
            { "data": 'funcao' },
            { "data": 'descricao' }
        ]
    });

}
