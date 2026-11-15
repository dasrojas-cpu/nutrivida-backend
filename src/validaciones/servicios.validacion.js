// Validar los datos de un servicio
function validarServicio(datos) {

    if (!datos || typeof datos !== 'object' ||
        Array.isArray(datos)) {
        return 'Datos invalidos';
    }

    const campos = {
        codigo: 20,
        tipo: 100,
        nombre: 150,
        duracion: 50,
        modalidad: 50,
        profesional: 100,
        descripcion: 2000
    };

    const permitidos = [
        ...Object.keys(campos),
        'precio'
    ];

    if (Object.keys(datos).some(
        campo => !permitidos.includes(campo)
    )) {
        return 'Existen campos no permitidos';
    }

    for (const campo of Object.keys(campos)) {

        if (typeof datos[campo] !== 'string' ||
            !datos[campo].trim()) {
            return 'Campo obligatorio: ' + campo;
        }

        if (datos[campo].trim().length > campos[campo]) {
            return 'Campo demasiado largo: ' + campo;
        }
    }

    if (!/^[A-Z0-9]+$/.test(datos.codigo)) {
        return 'Codigo de servicio invalido';
    }

    if (!Number.isInteger(datos.precio) ||
        datos.precio <= 0 ||
        datos.precio > 2147483647) {
        return 'El precio debe ser un entero positivo valido';
    }

    return null;
}

module.exports = {
    validarServicio
};
