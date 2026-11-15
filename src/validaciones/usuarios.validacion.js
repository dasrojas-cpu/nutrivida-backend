const dominiosPermitidos = [
    'duocuc.cl',
    'profesorduoc.cl',
    'gmail.com'
];

function validarRegistro(datos) {
    if (!datos || typeof datos !== 'object' ||
        Array.isArray(datos)) {
        return 'Datos de registro invalidos';
    }

    const campos = [
        'nombre',
        'apellido',
        'correo',
        'contrasena'
    ];

    if (Object.keys(datos).some(
        campo => !campos.includes(campo)
    )) {
        return 'Existen campos no permitidos';
    }

    for (const campo of campos) {
        if (typeof datos[campo] !== 'string' ||
            !datos[campo].trim()) {
            return 'Todos los campos son obligatorios';
        }
    }

    if (datos.nombre.trim().length > 100 ||
        datos.apellido.trim().length > 100) {
        return 'Nombre o apellido demasiado largo';
    }

    const correo = datos.correo.trim().toLowerCase();

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(correo) ||
        correo.length > 255) {
        return 'Correo electronico invalido';
    }

    const dominio = correo.split('@')[1];

    if (!dominiosPermitidos.includes(dominio)) {
        return 'Dominio de correo no permitido';
    }

    if (datos.contrasena.length < 15 ||
        datos.contrasena.length > 128) {
        return 'La contrasena debe tener entre 15 y 128 caracteres';
    }

    return null;
}

module.exports = {
    validarRegistro
};
