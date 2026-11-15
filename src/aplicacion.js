const express = require('express');
const cors = require('cors');

const rutasServicios = require(
    './rutas/servicios.rutas'
);

const rutasAutenticacion = require('./rutas/autenticacion.rutas');
const rutasReservas = require('./rutas/reservas.rutas');
const aplicacion = express();

// Configurar los origenes permitidos
aplicacion.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ]
}));

aplicacion.use(express.json());

// Comprobar el funcionamiento de la API
aplicacion.get('/', (solicitud, respuesta) => {
    respuesta.json({
        mensaje: 'API Nutrivida funcionando correctamente'
    });
});

// Rutas del catalogo
aplicacion.use('/api/servicios', rutasServicios);
aplicacion.use('/api/auth', rutasAutenticacion);
aplicacion.use('/api/reservas', rutasReservas);

// Controlar rutas inexistentes
aplicacion.use((solicitud, respuesta) => {
    respuesta.status(404).json({
        mensaje: 'Ruta no encontrada'
    });
});

// Controlar errores
aplicacion.use((error, solicitud, respuesta, siguiente) => {
    if (error.type === 'entity.parse.failed') {
        return respuesta.status(400).json({
            mensaje: 'Formato JSON invalido'
        });
    }

    console.error('Error interno:', error.code || error.name);

    respuesta.status(500).json({
        mensaje: 'Error interno del servidor'
    });
});

module.exports = aplicacion;
