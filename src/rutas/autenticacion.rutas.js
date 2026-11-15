const { Router } = require('express');

const controladorUsuarios = require(
    '../controladores/usuarios.controlador'
);

const controladorAutenticacion = require(
    '../controladores/autenticacion.controlador'
);

const limites = require(
    '../seguridad/limiteIntentos'
);

const seguridad = require(
    '../seguridad/autenticacion'
);

const enrutador = Router();

// Registrar pacientes
enrutador.post(
    '/register',
    limites.limiteRegistro,
    controladorUsuarios.registrar
);

// Iniciar sesion
enrutador.post(
    '/login',
    limites.limiteInicioSesion,
    controladorAutenticacion.iniciarSesion
);

// Consultar perfil protegido
enrutador.get(
    '/me',
    seguridad.autenticar,
    controladorAutenticacion.mostrarPerfil
);

module.exports = enrutador;
