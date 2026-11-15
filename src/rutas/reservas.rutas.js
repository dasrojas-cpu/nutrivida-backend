const { Router } = require('express');

const controlador = require(
    '../controladores/reservas.controlador'
);

const autenticacion = require(
    '../seguridad/autenticacion'
);

const permisos = require(
    '../seguridad/permisos'
);

const enrutador = Router();

// Todas las reservas requieren autenticacion
enrutador.use(autenticacion.autenticar);

// Agendar una reserva como paciente
enrutador.post(
    '/',
    permisos.permitirRoles('paciente'),
    controlador.agendar
);

// Consultar las reservas propias
enrutador.get(
    '/',
    permisos.permitirRoles(
        'paciente',
        'administrador'
    ),
    controlador.listarMisReservas
);

module.exports = enrutador;
