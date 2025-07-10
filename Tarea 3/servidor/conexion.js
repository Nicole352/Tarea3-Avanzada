const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '2002',
    database: 'formulario',
    connectionLimit: 10
});

const getConnection = (callback) => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error al obtener conexión:', err);
            callback(err, null);
        } else {
            callback(null, connection);
        }
    });
};

module.exports = getConnection;


