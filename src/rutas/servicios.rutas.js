const { Router } = require('express');

const controlador = require(
    '../controladores/servicios.controlador'
);

const administracion = require(
    '../controladores/administracion.controlador'
);

const autenticacion = require(
    '../seguridad/autenticacion'
);

const permisos = require(
    '../seguridad/permisos'
);

const enrutador = Router();

// Seguridad reutilizable para administradores
const accesoAdministrador = [
    autenticacion.autenticar,
    permisos.permitirRoles('administrador')
];

// Rutas publicas
enrutador.get('/', controlador.listar);
enrutador.get('/:codigo', controlador.buscar);

// Rutas administrativas
enrutador.post(
    '/',
    ...accesoAdministrador,
    administracion.crear
);

enrutador.put(
    '/:codigo',
    ...accesoAdministrador,
    administracion.actualizar
);

enrutador.delete(
    '/:codigo',
    ...accesoAdministrador,
    administracion.eliminar
);

module.exports = enrutador;
