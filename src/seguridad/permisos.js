// Comprobar los roles permitidos
function permitirRoles(...rolesPermitidos) {

    return function (solicitud, respuesta, siguiente) {

        if (!solicitud.usuario) {
            return respuesta.status(401).json({
                mensaje: 'Debe iniciar sesion'
            });
        }

        const rolUsuario = solicitud.usuario.rol;

        if (!rolesPermitidos.includes(rolUsuario)) {
            return respuesta.status(403).json({
                mensaje: 'No tiene permisos para realizar esta operacion'
            });
        }

        siguiente();
    };
}

module.exports = {
    permitirRoles
};
