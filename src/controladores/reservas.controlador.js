const servicio = require(
    '../servicios/reservas.servicio'
);

const validacion = require(
    '../validaciones/reservas.validacion'
);

// Definir los errores del negocio
const erroresReserva = {
    servicio: {
        estado: 404,
        mensaje: 'Servicio no disponible'
    },
    nutricionista: {
        estado: 404,
        mensaje: 'Nutricionista no disponible'
    },
    duracion: {
        estado: 409,
        mensaje: 'El servicio no tiene una duracion valida'
    },
    ocupado: {
        estado: 409,
        mensaje: 'El nutricionista no esta disponible en ese horario'
    }
};

// Agendar una nueva reserva
async function agendar(solicitud, respuesta) {

    const error = validacion.validarReserva(
        solicitud.body
    );

    if (error) {
        return respuesta.status(400).json({
            mensaje: error
        });
    }

    const resultado = await servicio.agendarReserva(
        solicitud.body,
        solicitud.usuario
    );

    if (resultado.error === 'horario') {
        return respuesta.status(400).json({
            mensaje: resultado.mensaje
        });
    }

    if (resultado.error) {
        const detalle = erroresReserva[resultado.error];

        if (!detalle) {
            throw new Error('Error de reserva no reconocido');
        }

        return respuesta.status(detalle.estado).json({
            mensaje: detalle.mensaje
        });
    }

    respuesta.set('Cache-Control', 'no-store');

    respuesta.status(201).json({
        mensaje: 'Reserva registrada correctamente',
        reserva: resultado.reserva
    });
}

// Consultar las reservas del usuario autenticado
async function listarMisReservas(solicitud, respuesta) {

    const reservas = await servicio.obtenerMisReservas(
        solicitud.usuario.id
    );

    respuesta.set('Cache-Control', 'no-store');

    respuesta.status(200).json(reservas);
}

module.exports = {
    agendar,
    listarMisReservas
};
