// Representar solamente los datos permitidos
function representarUsuario(usuario, rol) {
    return {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: rol,
        activo: usuario.activo
    };
}

module.exports = {
    representarUsuario
};
