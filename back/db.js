const sql = require('mssql')

/* DEV
const sqlConfig = {
    user: 'DB_A6D3B2_safehouse_admin',
    password: 'safeHouse@2022#',
    server: 'SQL5065.site4now.net',
    database: 'DB_A6D3B2_safehouse',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: false // change to true for local dev / self-signed certs
    }
}
*/

/* PROD*/
const sqlConfig = {
    user: 'safeadmin',
    password: 'Sh2022#@',
    server: 'safehouse.database.windows.net',
    database: 'safehouse_producao',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: false // change to true for local dev / self-signed certs
    }
}


async function execConsultas(consulta) {
    try {
       // console.log("aqui");
        await  sql.connect(sqlConfig);
      //  console.log(consulta);
        const result = await sql.query(consulta);
       
        // console.log(result);
        return result.recordsets;
    }
    catch (err) {
        return err;
    }

}


async function connect() {
    // config for your database
    var config = {
        user: 'DB_A6D3B2_safehouse_admin',
        password: 'safeHouse@2022#',
        server: 'SQL5065.site4now.net',
        database: 'DB_A6D3B2_safehouse'
    };

    // connect to your database
    sql.connect(config, function (err) {
        if (err) return err;
        var request = new sql.Request();
        request.query('exec sp_buscar_condominio 34', async function (err, recordset) {
            if (err) { return err; }

            console.log(recordset);
            return recordset;
        });
    });
}

module.exports = {execConsultas, connect }