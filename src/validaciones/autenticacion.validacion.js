// Validar los datos del inicio de sesion
function validarInicioSesion(datos) {
    if (!datos || typeof datos !== 'object' ||
        Array.isArray(datos)) {
        return 'Datos invalidos';
    }

    const campos = ['correo', 'contrasena'];

    if (Object.keys(datos).some(
        campo => !campos.includes(campo)
    )) {
        return 'Existen campos no permitidos';
    }

    if (typeof datos.correo !== 'string' ||
        typeof datos.contrasena !== 'string' ||
        !datos.correo.trim() ||
        !datos.contrasena) {
        return 'Debe completar todos los campos';
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(datos.correo.trim()) ||
        datos.correo.length > 255) {
        return 'Correo electronico invalido';
    }

    if (datos.contrasena.length > 128) {
        return 'Contrasena invalida';
    }

    return null;
}

module.exports = {
    validarInicioSesion
};
