const servicio = require(
    '../servicios/autenticacion.servicio'
);

const validacion = require(
    '../validaciones/autenticacion.validacion'
);

// Procesar el inicio de sesion
async function iniciarSesion(solicitud, respuesta) {

    const error = validacion.validarInicioSesion(
        solicitud.body
    );

    if (error) {
        return respuesta.status(400).json({
            mensaje: error
        });
    }

    const resultado = await servicio.iniciarSesion(
        solicitud.body
    );

    if (!resultado) {
        return respuesta.status(401).json({
            mensaje: 'Correo o contrasena incorrectos'
        });
    }

    respuesta.set('Cache-Control', 'no-store');

    respuesta.status(200).json({
        mensaje: 'Inicio de sesion correcto',
        ...resultado
    });
}

// Mostrar el perfil autenticado
function mostrarPerfil(solicitud, respuesta) {
    respuesta.set('Cache-Control', 'no-store');

    respuesta.status(200).json({
        usuario: solicitud.usuario
    });
}

module.exports = {
    iniciarSesion,
    mostrarPerfil
};
