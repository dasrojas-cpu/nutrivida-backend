// Obtener la duracion de una cita
function obtenerDuracionMinutos(servicio) {

    if (servicio.codigo.startsWith('PL') &&
        servicio.duracion.trim() === '—') {
        return 50;
    }

    const coincidencia = servicio.duracion
        .trim()
        .match(/^([0-9]+)\s*min$/i);

    if (!coincidencia) {
        return null;
    }

    const minutos = Number(coincidencia[1]);

    if (!Number.isInteger(minutos) ||
        minutos <= 0 || minutos > 480) {
        return null;
    }

    return minutos;
}

// Comprobar que la cita termine antes del cierre
function validarHoraTermino(fecha, hora, duracion) {

    const dia = new Date(
        fecha + 'T00:00:00Z'
    ).getUTCDay();

    const cierre = dia === 5 ? 780 : 1020;

    const [horas, minutos] = hora
        .split(':')
        .map(Number);

    const inicio = horas * 60 + minutos;

    return inicio + duracion <= cierre;
}

module.exports = {
    obtenerDuracionMinutos,
    validarHoraTermino
};
