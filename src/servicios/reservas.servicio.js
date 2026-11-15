const repositorio = require(
    '../repositorios/reservas.repositorio'
);

const transacciones = require(
    '../configuracion/transacciones'
);

const horarios = require('./horarios.servicio');
const duracion = require('./duracion.servicio');

const modelo = require(
    '../modelos/reservas.modelo'
);

// Agendar una reserva
async function agendarReserva(datos, usuario) {

    const errorHorario = horarios.validarHorario(
        datos.fecha_reserva,
        datos.hora_reserva
    );

    if (errorHorario) {
        return {
            error: 'horario',
            mensaje: errorHorario
        };
    }

    try {
        return await transacciones.ejecutarTransaccion(
            async cliente => {

                const servicio =
                    await repositorio.buscarServicio(
                        cliente,
                        datos.codigo_servicio
                    );

                if (!servicio) {
                    return { error: 'servicio' };
                }

                const nutricionista =
                    await repositorio.buscarNutricionista(
                        cliente,
                        datos.nutricionista_id
                    );

                if (!nutricionista) {
                    return { error: 'nutricionista' };
                }

                const minutos =
                    duracion.obtenerDuracionMinutos(
                        servicio
                    );

                if (!minutos) {
                    return { error: 'duracion' };
                }

                const terminoValido =
                    duracion.validarHoraTermino(
                        datos.fecha_reserva,
                        datos.hora_reserva,
                        minutos
                    );

                if (!terminoValido) {
                    return {
                        error: 'horario',
                        mensaje: 'La cita supera el horario de atencion'
                    };
                }

                // Preparar los datos desde el servidor
                const reserva = {
                    usuario_id: usuario.id,
                    nombre_paciente:
                        usuario.nombre + ' ' +
                        usuario.apellido,
                    correo: usuario.correo,
                    codigo_servicio: servicio.codigo,
                    nutricionista_id: nutricionista.id,
                    fecha_reserva: datos.fecha_reserva,
                    hora_reserva: datos.hora_reserva,
                    duracion_minutos: minutos,
                    precio: servicio.precio,
                    estado: 'confirmada'
                };

                // Comprobar disponibilidad
                const ocupado =
                    await repositorio.existeConflicto(
                        cliente,
                        reserva
                    );

                if (ocupado) {
                    return { error: 'ocupado' };
                }

                // Comprobar nuevamente el horario
                const horarioActual =
                    horarios.validarHorario(
                        reserva.fecha_reserva,
                        reserva.hora_reserva
                    );

                if (horarioActual) {
                    return {
                        error: 'horario',
                        mensaje: horarioActual
                    };
                }

                // Guardar la reserva
                const resultado =
                    await repositorio.crearReserva(
                        cliente,
                        reserva
                    );

                return {
                    reserva: modelo.representarReserva({
                        ...reserva,
                        id: resultado.id,
                        servicio: servicio.nombre,
                        nutricionista: nutricionista.nombre
                    })
                };
            }
        );

    } catch (error) {

        if (error.code === '23505' &&
            error.constraint === 'idx_reserva_horario') {
            return { error: 'ocupado' };
        }

        throw error;
    }
}

// Consultar las reservas propias del paciente
async function obtenerMisReservas(idUsuario) {

    const reservas =
        await repositorio.listarPorUsuario(idUsuario);

    return reservas.map(modelo.representarReserva);
}

module.exports = {
    agendarReserva,
    obtenerMisReservas
};
