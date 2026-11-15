const { validarCodigo } = require(
    './codigoServicio.validacion'
);

// Comprobar que la fecha exista
function validarFecha(fecha) {

    if (typeof fecha !== 'string' ||
        !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(fecha) ||
        fecha.startsWith('0000')) {
        return false;
    }

    const fechaComprobada = new Date(
        fecha + 'T00:00:00Z'
    );

    return !Number.isNaN(fechaComprobada.getTime()) &&
        fechaComprobada.toISOString().slice(0, 10) === fecha;
}

// Validar los campos de una reserva
function validarReserva(datos) {

    if (!datos || typeof datos !== 'object' ||
        Array.isArray(datos)) {
        return 'Datos de reserva invalidos';
    }

    const campos = [
        'codigo_servicio',
        'nutricionista_id',
        'fecha_reserva',
        'hora_reserva'
    ];

    if (Object.keys(datos).some(
        campo => !campos.includes(campo)
    )) {
        return 'Existen campos no permitidos';
    }

    if (!validarCodigo(datos.codigo_servicio)) {
        return 'Codigo de servicio invalido';
    }

    if (!Number.isInteger(datos.nutricionista_id) ||
        datos.nutricionista_id <= 0 ||
        datos.nutricionista_id > 2147483647) {
        return 'Nutricionista invalido';
    }

    if (!validarFecha(datos.fecha_reserva)) {
        return 'Fecha de reserva invalida';
    }

    if (typeof datos.hora_reserva !== 'string' ||
        !/^([01][0-9]|2[0-3]):(00|30)$/.test(
            datos.hora_reserva
        )) {
        return 'Hora de reserva invalida';
    }

    return null;
}

module.exports = {
    validarReserva
};
