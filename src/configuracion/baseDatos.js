require('dotenv').config({ quiet: true });

const { Pool } = require('pg');
const archivos = require('fs');
const sistema = require('os');
const rutas = require('path');

// Configurar la seguridad de la conexion
const seguridad = {
    rejectUnauthorized: true
};

const servidor = process.env.DB_HOST || '';

// Utilizar el certificado de AWS si corresponde
if (servidor.endsWith('.rds.amazonaws.com') &&
    !servidor.includes('.proxy-')) {
    seguridad.ca = archivos.readFileSync(
        rutas.join(
            sistema.homedir(),
            'certificados',
            'global-bundle.pem'
        ),
        'utf8'
    );
}

// Crear la conexion a PostgreSQL
const conexion = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: seguridad,
    connectionTimeoutMillis: 5000
});

module.exports = conexion;
