// Representar los datos de una reserva
function representarReserva(datos) {
    return {
        id: datos.id,
        codigo_servicio: datos.codigo_servicio,
        servicio: datos.servicio,
        nutricionista: datos.nutricionista,
        fecha_reserva: datos.fecha_reserva,
        hora_reserva: datos.hora_reserva,
        duracion_minutos: datos.duracion_minutos,
        precio: datos.precio,
        estado: datos.estado
    };
}

module.exports = {
    representarReserva
};
