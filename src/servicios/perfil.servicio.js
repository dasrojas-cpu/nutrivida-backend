const repositorio = require(
    '../repositorios/usuarios.repositorio'
);

const modelo = require(
    '../modelos/usuarios.modelo'
);

// Obtener el perfil de un usuario activo
async function obtenerPerfil(id) {
    const usuario = await repositorio.buscarPorId(id);

    if (!usuario || !usuario.activo) {
        return null;
    }

    return modelo.representarUsuario(
        usuario,
        usuario.rol
    );
}

module.exports = {
    obtenerPerfil
};
