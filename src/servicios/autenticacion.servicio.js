const repositorio = require(
    '../repositorios/usuarios.repositorio'
);

const contrasenas = require(
    '../seguridad/contrasenas'
);

const tokens = require(
    '../seguridad/tokens'
);

const modelo = require(
    '../modelos/usuarios.modelo'
);

// Comprobar las credenciales del usuario
async function iniciarSesion(datos) {
    const correo = datos.correo.trim().toLowerCase();

    const usuario = await repositorio.buscarPorCorreo(
        correo
    );

    if (!usuario) {
        await contrasenas.protegerContrasena(
            datos.contrasena
        );

        return null;
    }

    const contrasenaCorrecta =
        await contrasenas.verificarContrasena(
            datos.contrasena,
            usuario.hash
        );

    if (!contrasenaCorrecta || !usuario.activo) {
        return null;
    }

    const token = tokens.generarToken(usuario);

    return {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: tokens.vigencia,
        usuario: modelo.representarUsuario(
            usuario,
            usuario.rol
        )
    };
}

module.exports = {
    iniciarSesion
};
