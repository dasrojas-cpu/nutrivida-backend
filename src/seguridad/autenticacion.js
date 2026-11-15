const tokens = require('./tokens');

const perfil = require(
    '../servicios/perfil.servicio'
);

// Comprobar la identidad del usuario
async function autenticar(solicitud, respuesta, siguiente) {

    const encabezado = solicitud.headers.authorization || '';

    const coincidencia = encabezado.match(
        /^Bearer ([^\s]+)$/i
    );

    if (!coincidencia) {
        return respuesta.status(401).json({
            mensaje: 'Debe iniciar sesion'
        });
    }

    let identidad;

    try {
        identidad = tokens.verificarToken(
            coincidencia[1]
        );
    } catch (error) {
        return respuesta.status(401).json({
            mensaje: 'Token invalido o vencido'
        });
    }

    const id = Number(identidad.sub);

    if (!Number.isInteger(id) ||
        id < 1 || id > 2147483647) {
        return respuesta.status(401).json({
            mensaje: 'Identidad invalida'
        });
    }

    const usuario = await perfil.obtenerPerfil(id);

    if (!usuario) {
        return respuesta.status(401).json({
            mensaje: 'Cuenta no disponible'
        });
    }

    solicitud.usuario = usuario;

    siguiente();
}

module.exports = {
    autenticar
};
