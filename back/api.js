const path = require('path');
//const IP = '192.168.1.170';
const IP = '0.0.0.0';
const PORT = 3004;

const AxiosDigest = require('axios-digest').default;

const AxiosDigestAuth = require('@mhoc/axios-digest-auth').default;
const axios = require('axios');

const Buffer = require('zlib');

const getStream = require('get-stream');

const https = require("https");
const fs = require("fs");
const express = require("express");
const app = express();
const cors = require('cors');
app.use(express.json({ limit: '5000mb' }));

app.use((req, res, next) => {
    const allowedOrigins = ['http://www.safehouseportariavirtual.com.br:4433', 'http://safehouseportariavirtual.com.br:4433', 'https://safehouseportariavirtual.com.br:3333', 'http://20.226.89.150:4433', 'http://192.168.0.76:8080', 'http://spasafehouse.ddns.net:8081', 'http://186.212.27.180:8081', 'http://192.168.1.170:8080', 'https://wbsdev.com.br', 'http://127.0.0.1:5500', 'https://homologacao.igmschool.com.br', 'http://homologacao.igmschool.com.br', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081', 'http://localhost:8080', 'http://10.10.100.210:8080',
        'http://10.10.100.249:8080', 'http://192.168.0.103:8080', 'http://192.168.0.26:8080',
        'http://192.168.0.106:8080', 'http://192.168.0.104:8081', 'http://192.168.0.178:3000', 'http://192.168.0.178:8081',
        'http://192.168.0.174:8082', 'http://192.168.0.103:8080', 'http://192.168.15.74:8080', 'http://192.168.15.74:8081',
        'http://192.168.0.174:8080', 'http://192.168.0.174:8081', 'https://www.igmschool.com.br', 'https://igmschool.com.br',
        'http://127.0.0.1:9000', 'http://localhost:9000', "http://186.212.31.51:8081", "http://localhost:8080", "http://192.168.1.170:8080", "http://186.212.31.51/8081", "http://186.212.31.51:8081",
    ];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    return next();
});

app.use('/arquivos', express.static(path.join(__dirname, 'arquivos')));
app.use('/images', express.static(path.join(__dirname, 'images')));


const hikivision = require('./hikivision');

/*
var server = app.listen(PORT, IP, function () {
    console.log('Server is running..');
});
*/

/* HTTPS */

//app.use(express.static('arquivos'));


const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/safehouseportariavirtual.com.br/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/safehouseportariavirtual.com.br/fullchain.pem'),
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
};
https
    .createServer(options, app)
    .listen(PORT, IP, function (err) {
        if (err) console.log(err);
        console.log('Servidor ativo no IP: ' + IP + ', e porta: ', PORT);
    });


app.get('/', async function (req, res) {
    var FaceDataRecord = { "faceLibType": "blackFD", "FDID": "1", "FPID": "100" };
    url = 'http://192.168.1.148/ISAPI/Intelligent/FDLib/FDSetUp?format=json';
    var filepath = 'http://192.168.1.170:3004/images/27.jpg';
    // console.log(filepath);      
    const formData = new FormData()
    formData.append('FaceDataRecord', JSON.stringify(FaceDataRecord));
    const resp = await axios.get(filepath, { responseType: 'arraybuffer' });
    const filename = "100.jpg";
    let blob = resp.data;
    if (blob.length > 200 * 1024) {
        throw new Erro('200kb');
    }
    formData.append('FaceImage', blob, filename);
    const axiosDigest = new AxiosDigest('admin', 'anjos6567');
    const response = await axiosDigest.put(url, formData.getBuffer(), { headers: formData.getHeaders() });
    console.log(response.data);
    res.send(response.data);
})

const db = require("./db.js");


app.get('/getAllUsuariosDevice', async function (req, res) {
    const maxresult = req.query.maxresult;
    const position = req.query.position;
    const id_porta = req.query.id_porta;
    var equipamento = await db.execConsultas('exec ca.sp_get_equipamento_by_porta ' + id_porta);
    equipamento = equipamento[0][0];
    result = [];
    console.log("aqi");
    var posicao = parseInt(position);
    if (equipamento.id_modelo == 1) {
        var resultado = await hikivision.getAllUsers(maxresult, position, equipamento.ip + ":" + equipamento.porta, equipamento.usuario, equipamento.senha);
        result.push(resultado.UserInfoSearch.UserInfo);
        while (resultado.UserInfoSearch.responseStatusStrg == 'MORE') {
            //  console.log(posicao);
            resultado = await hikivision.getAllUsers(maxresult, posicao, equipamento.ip + ":" + equipamento.porta, equipamento.usuario, equipamento.senha);
            result.push(resultado.UserInfoSearch.UserInfo);
            posicao = posicao + 30;
        }

    }
    var final = [];
    for (var i = 0; i < result.length; i++) {
        for (var j = 0; j < result[i].length; j++) {
            final.push(result[i][j]);
        }

    }
    console.log(final.length);
    res.send(final);

});

app.get('/deleteUsuarioDevice', async function (req, res) {
    const id = req.query.id_pessoa;
    const ip_equipamento = req.query.ip_equipamento;
    const usuario = req.query.usuario;
    const senha = req.query.senha;
    const fabricante = req.query.fabricante;
    if (fabricante == 'HIKIVISION') {
        res.send(await hikivision.deletarUsuarioDevice(id, ip_equipamento, usuario, senha));
    }
    else {
        res.send("OK");
    }
});


app.get('/deletarUsuarioTodosEquipamentos', async function (req, res) {
    const id = req.query.id_pessoa;
    const id_condominio = req.query.id_condominio;
    var equipamentos = await db.execConsultas('exec ca.sp_get_equipamentos_condominio ' + id_condominio);
    equipamentos = equipamentos[0];
    var resposta = [];
    for (var i = 0; i < equipamentos.length; i++) {
        if (equipamentos[i].id_modelo == 1) {
            resposta.push(await hikivision.deletarUsuarioDevice(id, equipamentos[i].ip + ":" + equipamentos[i].porta, equipamentos[i].usuario, equipamentos[i].senha));
        }

    }
    res.send(resposta);
});





app.get('/getCondominio', async function (req, res) {
    const id_condominio = req.query.id_condominio;
    const id_usuario = req.query.id_usuario;
    log(id_usuario, 'BUSCA DE CONDOMINIO', 'BUSCA DE DADOS GERAIS DO CONDOMIIO');
    res.send(await db.execConsultas('exec ca.sp_buscar_condominio ' + id_condominio));
});

app.get('/getMoradoresCondominio', async function (req, res) {
    const id_condominio = req.query.id_condominio;
    const id_usuario = req.query.id_usuario;
    log(id_usuario, 'BUSCA DE MORADORES DO CONDOMINIO', 'CLIQUE NO BOTÃO PARA BUSCA DE MORADORES DO CONDOMINIO')
    res.send(await db.execConsultas('exec ca.sp_buscar_moradores_condominio ' + id_condominio));

});


app.get('/getEquipamentosCondominio', async function (req, res) {
    const id_condominio = req.query.id_condominio;
    const id_usuario = req.query.id_usuario;
    log(id_usuario, 'BUSCA DE EQUIPAMENTOS DO CONDOMINIO', 'CLIQUE NO BOTÃO PARA BUSCA DE EQUIPAMENTOS DO CONDOMINIO')
    var response = await db.execConsultas('exec ca.sp_get_equipamentos_condominio ' + id_condominio);
    equipamentos_global = response[0];
    // setInterval(buscarAcessosHoje, 10000);
    res.send(response);

});


app.get('/getModeloEquipamentos', async function (req, res) {
    const id_modelo = req.query.id_modelo;
    res.send(await db.execConsultas('exec ca.sp_get_modelos_equipamentos ' + id_modelo));
});


app.get('/getPortasCondominio', async function (req, res) {
    const id_condominio = req.query.id_condominio;
    const id_usuario = req.query.id_usuario;
    log(id_usuario, 'BUSCA DE PORTAS DO CONDOMINIO', 'CLIQUE NO BOTÃO PARA BUSCA DE PORTAS DO CONDOMINIO')
    res.send(await db.execConsultas('exec ca.sp_get_portas_condominio ' + id_condominio));
});


app.get('/getHorario', async function (req, res) {
    const id_condominio = req.query.id_condominio;
    const id_usuario = req.query.id_usuario;
    log(id_usuario, 'BUSCA DE HORÁRIOS DO CONDOMINIO', 'CLIQUE NO BOTÃO PARA BUSCA DE HORÁRIOS DO CONDOMINIO')
    res.send(await db.execConsultas('exec ca.sp_get_horario ' + id_condominio));
});

app.get('/getHorarioDetalhes', async function (req, res) {
    const id_horario = req.query.id_horario;
    const id_usuario = req.query.id_usuario;
    log(id_usuario, 'BUSCA DE DETALHES HORÁRIOS DO CONDOMINIO', 'CLIQUE NO BOTÃO PARA BUSCA DE HORÁRIOS DO CONDOMINIO')
    res.send(await db.execConsultas('exec ca.sp_get_horario_detalhes ' + id_horario));
});

app.get('/getPlacasPessoa', async function (req, res) {
    const id_pessoa = req.query.id_pessoa;
    const id_usuario = req.query.id_usuario;
    log(id_usuario, 'BUSCA DE PLACAS CADASTRADAS', 'CLIQUE NO BOTÃO PARA BUSCA DE PLACAS CADASTRADAS NO SISTEMA')
    res.send(await db.execConsultas('exec ca.sp_buscar_placas_pessoa ' + id_pessoa));
});

app.get('/getFotoPessoa', async function (req, res) {
    const id_pessoa = req.query.id_pessoa;
    const id_usuario = req.query.id_usuario;
    log(id_usuario, 'BUSCA DE FACE CADASTRADAS', 'CLIQUE NO BOTÃO PARA EXEBIÇÃO CADASTRADAS NO SISTEMA')
    res.send(await db.execConsultas('exec ca.sp_buscar_face_pessoa ' + id_pessoa));
});

app.post('/deletePlacaPessoa', async function (req, res) {
    const id_biometria = req.body.id_biometria;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'EXCLUSÃO DE PLACA', 'CLIQUE NO BOTÃO PARA EXCLUSÃO DE PLACA NO SISTEMA BIOMETRIA - ' + id_biometria)
    res.send(await db.execConsultas('exec ca.sp_delete_placa_pessoa ' + id_biometria));
});

app.post('/deleteHorario', async function (req, res) {
    const id_horario = req.body.id_horario;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'EXCLUSÃO DE HORÁRIOS', 'CLIQUE NO BOTÃO PARA EXCLUSÃO DE HORÁRIO NO SISTEMA ' + id_horario)
    res.send(await db.execConsultas('exec ca.sp_delete_horario ' + id_horario));
});


app.get('/getRelatorioAcessos', async function (req, res) {
    const id_condominio = req.query.id_condominio;
    const porta = req.query.porta;
    const inicio = req.query.inicio;
    const final = req.query.final;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'GERAR RELATÓRIO', 'CLIQUE NO BOTÃO PARA GERAÇÃO DE RELATÓRIOS NO SISTEMA')
    var resposta = await db.execConsultas('exec ca.sp_buscar_acessos_condominio ' + id_condominio + ',' + porta + ',' + '\'' + inicio + '\'' + ',' + '\'' + final + '\'');
    //console.log(resposta);
    res.send(resposta)
});




app.get('/informarNotificado', async function (req, res) {
    const id_acesso = req.query.id_acesso;
    var resposta = await db.execConsultas('exec ca.sp_notificar_acesso ' + id_acesso);
    //console.log(resposta);
    res.send(resposta)
});

app.get('/getRealTime', async function (req, res) {
    const id_condominio = req.query.id_condominio;
    const porta = req.query.porta;
    var resposta = await db.execConsultas('exec ca.sp_buscar_acessos_real_time ' + id_condominio + ',' + porta);
    //console.log(resposta);
    res.send(resposta)
});




app.post('/savePorta', async (req, res) => {
    const id_porta = req.body.id_porta;
    const id_condominio = req.body.id_condominio;
    const id_equipamento = req.body.id_equipamento;
    const id_rele = req.body.id_rele;
    const nome = req.body.nome;
    const localizacao = req.body.localizacao;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'SALVAR PORTA', 'CLIQUE NO BOTÃO PARA CRIAR / EDITAR PORTA NO SISTEMA')
    res.setHeader('Content-Type', 'application/json');
    console.log('exec ca.sp_save_porta ' + id_porta + ',' + id_condominio + ',' + id_equipamento + ',' + id_rele + ',\'' + nome + '\',' + localizacao);
    return res.send(await db.execConsultas('exec ca.sp_save_porta ' + id_porta + ',' + id_condominio + ',' + id_equipamento + ',' + id_rele + ',\'' + nome + '\',\'' + localizacao + '\''));
})



app.post('/savePermissao', async (req, res) => {
    const id_horario = req.body.id_horario;
    const id_portas = req.body.id_portas;
    const id_pessoas = req.body.id_pessoas;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'SALVAR PERMISSÃO', 'CLIQUE NO BOTÃO PARA CRIAR / EDITAR PERMISSÃO DE ACESSO NO SISTEMA');
    res.setHeader('Content-Type', 'application/json');
    console.log('exec ca.sp_save_permissao ' + id_horario + ',\'' + id_portas + '\',\'' + id_pessoas + '\'');
    return res.send(await db.execConsultas('exec ca.sp_save_permissao ' + id_horario + ',\'' + id_portas + '\',\'' + id_pessoas + '\''));
})



app.post('/saveEquipamento', async (req, res) => {
    const id_equipamento = req.body.id_equipamento;
    const id_modelo = req.body.id_modelo;
    const id_condominio = req.body.id_condominio;
    const ip = req.body.ip;
    const porta = req.body.porta;
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    const reles = req.body.reles;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'SALVAR EQUIPAMENTO', 'CLIQUE NO BOTÃO PARA CRIAR / EDITAR EQUIPAMENTO NO SISTEMA');
    res.setHeader('Content-Type', 'application/json');
    console.log('exec ca.sp_save_equipamento ' + id_equipamento + ',' + id_modelo + ',' + id_condominio + ',\'' + ip + '\',' + porta +
        ',\'' + usuario + '\',\'' + senha + '\',' + reles);
    return res.send(await db.execConsultas('exec ca.sp_save_equipamento ' + id_equipamento + ',' + id_modelo + ',' + id_condominio + ',\'' + ip + '\',' + porta +
        ',\'' + usuario + '\',\'' + senha + '\',' + reles));
})


app.post('/login', async (req, res) => {
    const email = req.body.email;
    const senha = req.body.senha;
    res.setHeader('Content-Type', 'application/json');
    console.log('exec ca.sp_login \'' + email + '\',\'' + senha + '\'');
    return res.send(await db.execConsultas('exec ca.sp_login \'' + email + '\',\'' + senha + '\''));
})


app.post('/saveBiometria', async (req, res) => {
    const id_pessoa = req.body.id_pessoa;
    const id_biometria = req.body.id_biometria;
    const valor = req.body.valor;
    const coacao = req.body.coacao;
    const tipo_pessoa = req.body.tipo_pessoa;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'SALVAR BIOMETRIA', 'CLIQUE NO BOTÃO PARA CRIAR / EDITAR BIOMETRIA NO SISTEMA - PESSOA ' + id_pessoa)
    res.setHeader('Content-Type', 'application/json');
    var nome = id_pessoa;
    if (tipo_pessoa == 2)
        nome = "99" + id_pessoa;
    writeFileSyncRecursive("images/" + nome + ".jpg", valor);
    return res.send(await db.execConsultas('exec ca.sp_save_biometria_pessoa ' + id_pessoa + ',\'' + id_biometria + '\',\'' + valor + '\',' + coacao + ',' + tipo_pessoa));
})


app.get('/getAcessosNotificacao', async function (req, res) {    
    const id_condominio = req.query.id_condominio;
    var resutl = await db.execConsultas('exec ca.ps_buscar_ultimos_acesso_notificar ' + id_condominio);
    console.log(resutl);
    res.send(resutl);
});


function writeFileSyncRecursive(filename, content) {
    console.log(filename);
    let filepath = filename.replace(/\\/g, '/');

    // -- preparation to allow absolute paths as well
    let root = '';
    if (filepath[0] === '/') {
        root = '/';
        filepath = filepath.slice(1);
    } else if (filepath[1] === ':') {
        root = filepath.slice(0, 3); // c:\
        filepath = filepath.slice(3);
    }

    // -- create folders all the way down
    const folders = filepath.split('/').slice(0, -1); // remove last item, file
    folders.reduce(
        (acc, folder) => {
            const folderPath = acc + folder + '/';
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            return folderPath
        },
        root // first 'acc', important
    );

    // -- write file
    fs.writeFileSync(root + filepath, content, 'base64', (err, data) => {
        if (err) {
            console.log({ "Error": true, "Message": "Erro ao fazer upload de imagem" })
        } else {
            console.log('upload feito' + newName);
        }
    })
}



app.post('/saveHorario', async (req, res) => {
    const id_horario = req.body.id_horario;
    const id_condominio = req.body.id_condominio;
    const nome = req.body.nome;
    const descricao = req.body.descricao;
    const iniciodomingo = req.body.iniciodomingo;
    const finaldomingo = req.body.finaldomingo;
    const iniciosegunda = req.body.iniciosegunda;
    const finalsegunda = req.body.finalsegunda;
    const inicioterca = req.body.inicioterca;
    const finalterca = req.body.finalterca;
    const inicioquarta = req.body.inicioquarta;
    const finalquarta = req.body.finalquarta;
    const inicioquinta = req.body.inicioquinta;
    const finalquinta = req.body.finalquinta;
    const iniciosexta = req.body.iniciosexta;
    const finalsexta = req.body.finalsexta;
    const iniciosabado = req.body.iniciosabado;
    const finalsabado = req.body.finalsabado;

    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'SALVAR HORÁRIO', 'CLIQUE NO BOTÃO PARA CRIAR / EDITAR HORARIO NO SISTEMA - PESSOA ' + nome)
    res.setHeader('Content-Type', 'application/json');
    console.log('exec ca.sp_save_horario ' + id_horario + ',' + id_condominio + ',\'' + nome + '\',\'' + descricao + '\',\'' + iniciodomingo + '\',\'' +
        finaldomingo + '\',\'' + iniciosegunda + '\',\'' + finalsegunda + '\',\'' + inicioterca + '\',\'' + finalterca + '\',\'' + inicioquarta + '\',\'' + finalquarta + '\',\'' +
        inicioquinta + '\',\'' + finalquinta +
        '\',\'' + iniciosexta + '\',\'' + finalsexta + '\',\'' + iniciosabado + '\',\'' + finalsabado + '\'');

    return res.send(await db.execConsultas('exec ca.sp_save_horario ' + id_horario + ',' + id_condominio + ',\'' + nome + '\',\'' + descricao + '\',\'' + iniciodomingo + '\',\'' +
        finaldomingo + '\',\'' + iniciosegunda + '\',\'' + finalsegunda + '\',\'' + inicioterca + '\',\'' + finalterca + '\',\'' + inicioquarta + '\',\'' + finalquarta + '\',\'' +
        inicioquinta + '\',\'' + finalquinta +
        '\',\'' + iniciosexta + '\',\'' + finalsexta + '\',\'' + iniciosabado + '\',\'' + finalsabado + '\''));
})


// COMUNICACAO HIKIVISION
//var request = require('request');
const request = require('request-promise');

var FormData = require('form-data');
const { Console } = require('console');



async function log(id_usuario, funcao, descricao) {
    await db.execConsultas('exec ca.sp_inserir_log ' + id_usuario + ',' + '\'' + funcao + '\'' + ',' + '\'' + descricao + '\'');
}

var equipamentos_global;
app.get('/buscarAcessos', async (req, res) => {
    const id_condominio = req.query.id_condominio;
    const startTime = req.query.startTime;
    const endTime = req.query.endTime;
    res.setHeader('Content-Type', 'application/json');
    var response = await db.execConsultas('exec ca.sp_get_equipamentos_condominio ' + id_condominio);
    response = response[0];
    // buscarAcessos(startTime,endTime,response[0].ip,response[0].usuario,response[0].senha);    
    for (var i = 0; i < response.length; i++) {
        if (response[i].id_modelo == 1) {
            await buscarAcessos(startTime, endTime, response[i].ip + ":" + response[i].porta, response[i].usuario, response[i].senha, response[i].portaid);
        }
    }
})


app.get('/buscarLogs', async (req, res) => {
    const id_condominio = req.query.id_condominio;
    const inicio = req.query.inicio;
    const final = req.query.final;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'BUSCAR LOGS', 'CLIQUE NO BOTÃO PARA BUSCAR LOGS NO SISTEMA')
    res.setHeader('Content-Type', 'application/json');
    var response = await db.execConsultas('exec ca.sp_buscar_logs ' + id_condominio + ',' + '\'' + inicio + '\'' + ',' + '\'' + final + '\'');
    res.send(response);
})


app.get('/buscarUsuarios', async (req, res) => {
    const id_condominio = req.query.id_condominio;
    const id_usuario_edit = req.query.id_usuario_edit;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'BUSCAR LOGS', 'CLIQUE NO BOTÃO PARA BUSCAR LOGS NO SISTEMA')
    res.setHeader('Content-Type', 'application/json');
    var response = await db.execConsultas('exec ca.sp_buscar_usuario ' + id_condominio + ',' + id_usuario_edit);
    res.send(response);
})



async function buscarAcessosHoje() {
    var date = new Date();
    var startTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + "T00:00:00-03:00";
    var endTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + "T23:59:59-03:00";

    for (var i = 0; i < equipamentos_global.length; i++) {
        if (equipamentos_global[i].id_modelo == 1) {
            await buscarAcessos(startTime, endTime, equipamentos_global[i].ip, equipamentos_global[i].usuario, equipamentos_global[i].senha, equipamentos_global[i].portaid);
        }
    }
}

async function chamadaRelatorio(startTime, endTime, ip_equipamento, usuario, senha, position) {
    json = true;
    funcao = "/ISAPI/AccessControl/AcsEvent?format=json";
    var inicio = (position + 1) * 30;
    var parms = {
        "AcsEventCond": {
            "searchID": "1",
            "searchResultPosition": inicio,
            "maxResults": 30,
            "major": 0,
            "minor": 0,
            "startTime": "" + startTime + "",
            "endTime": "" + endTime + ""
        }
    };
    url = "http://" + ip_equipamento + funcao;
    return await
        request({
            'url': url,
            'method': 'POST',
            'auth': {
                'user': '' + usuario + '',
                'password': '' + senha + '',
                'sendImmediately': false
            },
            'followRedirect': true,
            'followAllRedirects': true,
            'json': json,
            'body': parms
        },
            async function (error, response, body) {
                var data = await response.body.AcsEvent.InfoList;
                return data;
            }
        );

}

app.get('/sincronizarImages/', async function (req, res) {
    var response = await db.execConsultas('exec ca.sp_buscar_fotos 1');
    response = response[0];
    for (var i = 0; i < response.length; i++) {
        var nome = response[i].id_pessoa;
        if (response[i].tipo_pessoa == 2) {
            nome = "99" + response[i].id_pessoa;
        }
        console.log(nome);
        Upload("images/" + nome + ".jpg", response[i].valor);
    }
    res.send("OK");
})

function Upload(newName, base64Data) {
    fs.writeFile(newName, base64Data, 'base64', (err, data) => {
        if (err) {
            return console.log('ERRO');
        } else {
            console.log('upload feito' + newName);
        }
    })
}

async function buscarAcessos(startTime, endTime, ip_equipamento, usuario, senha, id_porta) {
    try {
        json = true;
        funcao = "/ISAPI/AccessControl/AcsEvent?format=json";
        var parms = {
            "AcsEventCond": {
                "searchID": "1",
                "searchResultPosition": 0,
                "maxResults": 30,
                "major": 0,
                "minor": 0,
                "startTime": "" + startTime + "",
                "endTime": "" + endTime + ""
            }
        };
        url = "http://" + ip_equipamento + funcao;
        await
            request({
                'url': url,
                'method': 'POST',
                'auth': {
                    'user': '' + usuario + '',
                    'password': '' + senha + '',
                    'sendImmediately': false
                },
                'followRedirect': true,
                'followAllRedirects': true,
                'json': json,
                'body': parms
            },
                async function (error, response, body) {

                    // var data = response.body.AcsEvent.InfoList;
                    //   if (ip_equipamento == '192.168.1.147') {

                    var data = response.body.AcsEvent;

                    var data_montada = [];
                    if (data != undefined && data != null) {
                        if (data.totalMatches > 0) {

                            data_montada.push(data.InfoList);
                            var position = Math.round(data.totalMatches / 30) - 1;
                            console.log(position);

                            for (var j = 1; j < position; j++) {
                                var info = await chamadaRelatorio(startTime, endTime, ip_equipamento, usuario, senha, j);
                                data_montada.push(info.AcsEvent.InfoList);

                            }
                            console.log(data_montada);

                            var dataFinal = "insert into ca.acessos (tipo_verificacao,id_pessoa,data,id_porta,serial) SELECT * from  (VALUES  ";
                            var entrou = 0;
                            for (var i = 0; i < data_montada.length; i++) {
                                for (var y = 0; y < data_montada[i].length; y++) {

                                    if (data_montada[i][y] != null && data_montada[i][y] != undefined) {
                                        if (data_montada[i][y].currentVerifyMode != 'invalid' && data_montada[i][y].currentVerifyMode != undefined) {
                                            if (data_montada[i][y].employeeNoString != null && data_montada[i][y].employeeNoString != undefined) {
                                                if (parseInt(data_montada[i][y].time.substring(0, 4)) > 2022) {
                                                    dataFinal += "('" + data_montada[i][y].currentVerifyMode + "'," + data_montada[i][y].employeeNoString + ",DATEADD(HOUR,3,'" + data_montada[i][y].time.substring(0, 19) + "')," + id_porta + "," + data_montada[i][y].serialNo + "),";
                                                    entrou++;
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                            dataFinal += ");";
                            dataFinal = dataFinal.replace(",);", ") AS temp (tipo_verificacao,id_pessoa,data,id_porta,serial);");

                            console.log(entrou);

                            if (entrou > 0) {
                                var retorno = await db.execConsultas(dataFinal);
                                console.log(retorno);
                                await db.execConsultas('ca.sp_deletar_acessos_repetidos');
                            }
                        }
                    }
                }
                //   }
            );
    }
    catch (ex) {
        console.log(ex);
    }
}
async function SendIntelbras(parms, usuario, senha, urlintelbras) {
    console.log("Enviando Usurios");

    try {
        await request({
            'url': urlintelbras,
            'method': 'POST',
            'auth': {
                'user': '' + usuario + '',
                'password': '' + senha + '',
                'sendImmediately': false
            },
            'followRedirect': true,
            'followAllRedirects': true,
            'json': json,
            'body': parms
        },
            async function (error, response, body) {
                console.log(error);
                console.log(body);
                //  console.log(response);
                return "ok"; //console.log(response);

            }
        );
    } catch (ex) {
        console.log("ERRO ENVIO");
    }
}

async function enviarUsuarioIntelbras(pessoas, ip_equipamento, usuario, senha) {
    json = true;
    funcao = "/cgi-bin/AccessUser.cgi?action=insertMulti";
    urlintelbras = "http://" + ip_equipamento + funcao;
    var j = 1;
    var chamada = 0;
    var pessoas_parte = [];
    for (var i = 0; i < pessoas.length; i++) {
        if (j <= 10) {
            pessoas_parte.push(pessoas[i]);
        } else {
            var json_pronto = "{\"UserList\":" + JSON.stringify(pessoas_parte) + "}";
            var parms = JSON.parse(json_pronto);
            await SendIntelbras(parms, usuario, senha, urlintelbras);
            j = 0;
            chamada++;
            pessoas_parte = [];
        }
        j++;
    }
    console.log(chamada);
    var json_pronto = "{\"UserList\":" + JSON.stringify(pessoas_parte) + "}";
    var parms = JSON.parse(json_pronto);
    await SendIntelbras(parms, usuario, senha, urlintelbras);
}

async function enviarFotosIntelbras(pessoas, ip_equipamento, usuario, senha) {
    json = true;
    funcao = "/cgi-bin/AccessFace.cgi?action=insertMulti";
    urlintelbras = "http://" + ip_equipamento + funcao;
    var j = 1;
    var chamada = 0;
    var pessoas_parte = [];

    for (var i = 0; i < pessoas.length; i++) {
        if (j <= 10) {
            pessoas_parte.push(pessoas[i]);
        } else {
            //   var json_pronto = "{\"FaceList\":" + JSON.stringify(pessoas_parte) + "}";
            var json_pronto = { "FaceList": [JSON.stringify(pessoas_parte)] };
            //    var parms = JSON.parse(json_pronto);
            //  console.log(json_pronto);
            await SendIntelbras(json_pronto, usuario, senha, urlintelbras);
            j = 0;
            chamada++;
            pessoas_parte = [];
        }
        j++;
    }

    console.log(chamada);
    var json_pronto = "{\"FaceList\":" + JSON.stringify(pessoas_parte) + "}";
    var parms = JSON.parse(json_pronto);
    //  await SendIntelbras(parms, usuario, senha, urlintelbras);
}




async function enviarUsuario(id, nome, ip_equipamento, usuario, senha) {
    json = true;
    funcao = "/ISAPI/AccessControl/UserInfo/SetUp?format=json";

    var parms = {
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
    console.log(parms);
    url = "http://" + ip_equipamento + funcao;
    await request({
        'url': url,
        'method': 'PUT',
        'auth': {
            'user': '' + usuario + '',
            'password': '' + senha + '',
            'sendImmediately': false
        },
        'followRedirect': true,
        'followAllRedirects': true,
        'json': json,
        'body': parms
    },
        async function (error, response, body) {
            console.log(error);

            return "ok"; //console.log(response);

        }
    );
}


async function enviarFoto(id, ip_equipamento, usuario, senha, tipo_pessoa) {
    try {

        var funcao = '/ISAPI/Intelligent/FDLib/FDSetUp?format=json';
        /* if (tipo_pessoa == 2) {
             id = id.replace("9999999", "") + ".jpg";
         }
         */
        var FaceDataRecord = { "faceLibType": "blackFD", "FDID": "1", "FPID": "" + id + "" };
        url = "http://" + ip_equipamento + funcao;

        var filepath = 'https://safehouseportariavirtual.com.br:3004/images/' + id + '.jpg';

        const formData = new FormData()
        formData.append('FaceDataRecord', JSON.stringify(FaceDataRecord));
        const resp = await axios.get(filepath, { responseType: 'arraybuffer' });
        const filename = id + ".jpg";
        let blob = resp.data;
        if (blob.length > 200 * 1024) {
            throw new Erro('200kb');
        }
        formData.append('FaceImage', blob, filename);
        const axiosDigest = new AxiosDigest(usuario, senha);
        const response = await axiosDigest.put(url, formData.getBuffer(), { headers: formData.getHeaders() });
        //  console.log(response.data);
    } catch (ex) {
        console.log('Erro - ' + ex);
    }
    //res.send(response.data);
}


app.get('/getRegras', async (req, res) => {
    const id_condominio = req.query.id_condominio;
    const id_usuario = req.query.id_usuario;
    res.setHeader('Content-Type', 'application/json');
    log(id_usuario, 'BUSCAR REGRAS', 'CLIQUE NO BOTÃO DE BUSCAR TODOS AS REGRAS DE ACESSOS')
    return res.send(await db.execConsultas('exec ca.sp_buscar_totos_faciais ' + id_condominio));

})

app.post('/removerPermissao', async (req, res) => {
    const id_permissao = req.body.id_permissao;
    const id_pessoa = req.body.id_pessoa;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'REMOVER PERMISSÃO DE ACESSO', 'CLIQUE NO BOTÃO DE REMOVER PERMISSÃO DO USUÁRIO')
    res.setHeader('Content-Type', 'application/json');
    return res.send(await db.execConsultas('exec ca.sp_remover_permissao ' + id_permissao + ',' + id_pessoa));

})

//sincrinizarImagesAuto();
//sincronizarPlacasAuto();
SincronizarFacesAuto();
//setInterval(sincronizarPlacasAuto, 600000);
setInterval(SincronizarFacesAuto, 300000);
//setInterval(sincrinizarImagesAuto, 600000);
async function sincrinizarImagesAuto() {
    await
        request({
            'url': "http://192.168.1.170:3004/sincronizarImages",
            'method': 'GET'
        },
            function (error, response, body) {
                console.log(error);
                console.log(body);

            });
    //http://192.168.1.170:3004/sincronizarImages
}

async function sincronizarPlacasAuto() {
    console.log("SISTEMA SINCRONIZANDO AS  PLACAS COM OS EQUIPAMENTOS LPR");
    const id_condominio = 1;
    const id_usuario = 0;
    log(id_usuario, 'SINCRONIZAÇÃO AUTOMATICA PLACAS', 'SISTEMA SINCRONIZANDO AS  PLACAS COM OS EQUIPAMENTOS LPR');
    // res.setHeader('Content-Type', 'application/json');
    var response = await db.execConsultas('exec ca.sp_buscar_todas_placas ' + id_condominio);
    response = response[0];
    var j = 1;
    for (var i = 0; i < response.length; i++) {
        //  await setTimeout(enviarPlacas, 1000, response[i].pessoaid, response[i].nomecompleto, response[i].placa, response[i].ip, response[i].usuario, response[i].senha);
        if (j == 25) {
            console.log("aqui");
            await new Promise(r => setTimeout(r, 10000));
            await enviarPlacas(response[i].pessoaid, response[i].nomecompleto, response[i].placa, response[i].ip, response[i].usuario, response[i].senha);

            j = 0;
        } else {
            await enviarPlacas(response[i].pessoaid, response[i].nomecompleto, response[i].placa, response[i].ip, response[i].usuario, response[i].senha);
        }
        j++;
    }
}
async function SincronizarFacesAuto() {
    const id_condominio = 43;
    const id_usuario = 0;
    console.log('SISTEMA SINCRONIZANDO AS FACES COM OS EQUIPAMENTOS');
    log(id_usuario, 'SINCRONIZAÇÃO AUTOMATICA FACIAL', 'SISTEMA SINCRONIZANDO AS FACES COM OS EQUIPAMENTOS');
    //  res.setHeader('Content-Type', 'application/json');
    var response = await db.execConsultas('exec ca.sp_buscar_totos_faciais ' + id_condominio);
    console.log(response);
    response = response[0];
    var device_intelbras = [];
    usuariosIntelbras = [];
    fotosIntelbras = [];
    for (var i = 0; i < response.length; i++) {
        //tratamento provisorio para nao quebrar no IP Alterado 
        //&& response[i].ip == "192.168.1.151"
        if (response[i].ip != "192.168.1.145") {
            try {
                //console.log(response[i].nomecompleto + " - " + response[i].ip);
                if (response[i].modelo == 3) {
                    console.log("Intelbras");
                    var p = {
                        ip: response[i].ip,
                        usuario: response[i].usuario,
                        senha: response[i].senha
                    };
                    if (device_intelbras.length == 0) {
                        device_intelbras.push(p);
                    }
                    addUserIntelbras(response[i].pessoaid, response[i].nomecompleto);
                    addFaceIntelbras(response[i].pessoaid, response[i].valor)
                    //   enviarUsuarioIntelbras(response[i].pessoaid, response[i].nomecompleto, response[i].ip, response[i].usuario, response[i].senha);
                } else {
                    await enviarUsuario(response[i].pessoaid, response[i].nomecompleto, response[i].ip + ":" + response[i].porta, response[i].usuario, response[i].senha);
                    console.log('Usuario Enviado');
                    await enviarFoto(response[i].pessoaid, response[i].ip + ":" + response[i].porta, response[i].usuario, response[i].senha, response[i].tipo_pessoa);
                    console.log('Foto Enviada');
                }


            } catch (ex) {
                console.log(ex);
            }
        }
    }
    // console.log(usuariosIntelbras);
    for (var j = 0; j < device_intelbras.length; j++) {
        await enviarUsuarioIntelbras(usuariosIntelbras, device_intelbras[j].ip, device_intelbras[j].usuario, device_intelbras[j].senha);
        await enviarFotosIntelbras(fotosIntelbras, device_intelbras[j].ip, device_intelbras[j].usuario, device_intelbras[j].senha);
    }
}

var usuariosIntelbras = [];
var fotosIntelbras = [];

function addFaceIntelbras(id, foto) {
    var param = {
        "UserID": id,
        "PhotoData": [
            foto
        ]
    };
    fotosIntelbras.push(param);
}

function addUserIntelbras(id, nome) {
    var param = {
        "UserID": id,
        "UserName": nome,
        "UserType": 0,
        "Authority": 2,
        "Password": "878485",
        "Doors": [
            0
        ],
        "TimeSections": [
            255
        ],
        "ValidFrom": "2019-01-02 00:00:00",
        "ValidTo": "2037-01-02 01:00:00"
    }
    usuariosIntelbras.push(param);
}


app.get('/syncAllUsers', async (req, res) => {
    const id_condominio = req.query.id_condominio;
    const id_usuario = req.body.id_usuario;
    log(id_usuario, 'SINCRONIZAÇÃO TOTAL FACIAL', 'CLIQUE NO BOTÃO SINCRONIZAÇÃO GERAL DO EQUIPAMENTO')
    res.setHeader('Content-Type', 'application/json');
    var response = await db.execConsultas('exec ca.sp_buscar_totos_faciais ' + id_condominio);
    response = response[0];
    /*
        for (var i = 0; i < response.length; i++) {

            await enviarUsuario(response[i].pessoaid, response[i].nomecompleto, response[i].ip, response[i].usuario, response[i].senha);
            console.log('Usuario Enviado');
            await enviarFoto(response[i].pessoaid, response[i].ip, response[i].usuario, response[i].senha, response[i].tipo_pessoa);
            console.log('Foto Enviada');

        }
        */
    /*
      for(var i=0;i<response.length;i++)
      {
        enviarFoto(response[i].pessoaid,response[i].ip,response[i].usuario,response[i].senha);
       
      }
    */
    return res.send("OK");
})


app.get('/syncAllPlacas', async (req, res) => {
    const id_condominio = req.query.id_condominio;
    const id_usuario = req.query.id_usuario;
    log(id_usuario, 'SINCRONIZAÇÃO TOTAL PLACAS', 'CLIQUE NO BOTÃO SINCRONIZAÇÃO GERAL DO EQUIPAMENTO LPR')
    res.setHeader('Content-Type', 'application/json');
    var response = await db.execConsultas('exec ca.sp_buscar_todas_placas ' + id_condominio);
    response = response[0];

    for (var i = 0; i < response.length; i++) {

        enviarPlacas(response[i].pessoaid, response[i].nomecompleto, response[i].placa, response[i].ip, response[i].usuario, response[i].senha);
    }

    return res.send("OK");
})

app.get('/leituraPlaca', async (req, res) => {
    buscarLeituras('192.168.1.141', 'admin', 'anjos6567');
})

async function buscarLeituras(ip_equipamento, usuario, senha) {

    var url = "http://" + ip_equipamento + "/cgi-bin/snapManager.cgi?action=attachFileProc&Flags[0]=Event&Events=[TrafficJunction]&heartbeat=5";
    await
        request({
            'url': url,
            'method': 'GET',
            'auth': {
                'user': '' + usuario + '',
                'password': '' + senha + '',
                'sendImmediately': false
            }
        },
            function (error, response, body) {
                console.log(error);
                console.log(body);

            });

}


async function enviarPlacas(id, nome, placa, ip_equipamento, usuario, senha) {
    try {
        json = true;
        funcao = "/cgi-bin/recordUpdater.cgi?action=insert&name=TrafficRedList&PlateNumber=" + placa + "&MasterOfCar=" + nome.split(' ')[0] + "&BeginTime=2022-01-01%2012:00:00&CancelTime=2032-01-10%2012:00:00&AuthorityList.OpenGate=true";
        url = "http://" + ip_equipamento + funcao;
        console.log(url);
        await
            request({
                'url': url,
                'method': 'GET',
                'auth': {
                    'user': '' + usuario + '',
                    'password': '' + senha + '',
                    'sendImmediately': false
                }
            },
                function (error, response, body) {
                    try {
                        console.log(error);
                        return "ok"; //console.log(response);
                    } catch (ex) {
                        console.log(ex);
                        return "Falha"; //console.log(response);
                    }


                }
            );
    } catch (ex) {
        console.log("Já Existe");
    }
}





app.post('/postHiki', async (req, res) => {
    const ip_equipamento = req.body.ip_equipamento;
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    const metodo = req.body.metodo;
    const type = req.body.type;
    var parms = {};
    var funcao = "";
    var json = true;
    var formData = "";
    res.setHeader('Content-Type', 'application/json');


    var url = "";

    switch (metodo) {
        case "GetAllUsuariosDevice":
            {
                funcao = "/ISAPI/AccessControl/UserInfo/Search?format=json";
                parms = {
                    "UserInfoSearchCond": {
                        "searchID": "1",
                        "searchResultPosition": 0,
                        "maxResults": 30
                    }
                }
                break;
            }
        case "aberturaRemota":
            {
                funcao = "/ISAPI/AccessControl/RemoteControl/door/65535";
                parms = "<RemoteControlDoor version=\"2.0\" xmlns=\"http://www.isapi.org/ver20/XMLSchema\">";
                parms += " <cmd>open</cmd>";
                parms += "</RemoteControlDoor>";
                json = false;
                break;
            }
        case "addUser":
            {
                const codigo = 28; // req.body.codigo;
                const nome = "Cristiano Ronaldo"; // req.body.nome;
                json = true;
                funcao = "/ISAPI/AccessControl/UserInfo/SetUp?format=json";
                parms = {
                    "UserInfo": {
                        "employeeNo": "" + codigo + "",
                        "name": "" + nome + "",
                        "userType": "normal",
                        "Valid": {
                            "enable": false,
                            "beginTime": "2021-12-01T17:30:08",
                            "endTime": "2030-08-01T17:30:08"
                        },
                        "doorRight": "1",
                        "RightPlan": [{
                            "doorNo": 1,
                            "planTemplateNo": "1"
                        }]
                    }
                }
                break;
            }
        case "addFaceUser":
            {
                codigo = 28;
                var funcao = '/ISAPI/Intelligent/FDLib/FDSetUp?format=json';
                var FaceDataRecord = { "faceLibType": "blackFD", "FDID": "1", "FPID": "" + codigo + "" };
                url = "http://" + ip_equipamento + funcao;

                var filepath = 'http://192.168.1.170:3004/images/' + codigo + '.jpg';
                const formData = new FormData()
                formData.append('FaceDataRecord', JSON.stringify(FaceDataRecord));
                const resp = await axios.get(filepath, { responseType: 'arraybuffer' });
                const filename = "100.jpg";
                let blob = resp.data;
                if (blob.length > 200 * 1024) {
                    throw new Erro('200kb');
                }
                formData.append('FaceImage', blob, filename);
                const axiosDigest = new AxiosDigest('admin', 'anjos6567');
                const response = await axiosDigest.put(url, formData.getBuffer(), { headers: formData.getHeaders() });
                console.log(response.data);
                res.send(response.data);
                break;
            }
    }


    if (metodo != "addFaceUser") {
        console.log("aqio");
        url = "http://" + ip_equipamento + funcao;
        console.log(url);
        await
            request({
                'url': url,
                'method': type,
                'auth': {
                    'user': '' + usuario + '',
                    'password': '' + senha + '',
                    'sendImmediately': false
                },
                formData: formData,
                'followRedirect': true,
                'followAllRedirects': true,
                'json': json,
                'body': parms
            },
                function (error, response, body) {
                    console.log(error);
                    return res.send(response);
                }
            );
    }

})