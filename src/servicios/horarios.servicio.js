// Obtener la fecha y hora actual de Chile
function obtenerFechaHoraActual(ahora = new Date()) {

    const formato = new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    });

    const partes = Object.fromEntries(
        formato.formatToParts(ahora).map(
            parte => [parte.type, parte.value]
        )
    );

    return {
        fecha: partes.year + '-' +
            partes.month + '-' + partes.day,

        hora: partes.hour + ':' + partes.minute
    };
}

// Obtener el dia de la semana
function obtenerDiaSemana(fecha) {
    return new Date(
        fecha + 'T00:00:00Z'
    ).getUTCDay();
}

// Validar el horario de atencion
function validarHorario(
    fecha,
    hora,
    ahora = new Date()
) {

    const actual = obtenerFechaHoraActual(ahora);

    if (fecha < actual.fecha ||
        (fecha === actual.fecha && hora <= actual.hora)) {
        return 'No se permiten reservas en horarios pasados';
    }

    const dia = obtenerDiaSemana(fecha);

    if (dia === 0 || dia === 6) {
        return 'No se realizan reservas durante el fin de semana';
    }

    const cierre = dia === 5 ? '13:00' : '17:00';

    if (hora < '09:00' || hora >= cierre) {
        return 'La hora esta fuera del horario de atencion';
    }

    return null;
}

module.exports = {
    obtenerFechaHoraActual,
    validarHorario
};
