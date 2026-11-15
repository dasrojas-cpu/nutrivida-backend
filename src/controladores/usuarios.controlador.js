const servicio = require(
    '../servicios/usuarios.servicio'
);

const validacion = require(
    '../validaciones/usuarios.validacion'
);

// Recibir una solicitud de registro
async function registrar(solicitud, respuesta) {
    const error = validacion.validarRegistro(
        solicitud.body
    );

    if (error) {
        return respuesta.status(400).json({
            mensaje: error
        });
    }

    const usuario = await servicio.registrarUsuario(
        solicitud.body
    );

    if (!usuario) {
        return respuesta.status(409).json({
            mensaje: 'El correo ya se encuentra registrado'
        });
    }

    respuesta.status(201).json({
        mensaje: 'Usuario registrado correctamente',
        usuario: usuario
    });
}

module.exports = {
    registrar
};
