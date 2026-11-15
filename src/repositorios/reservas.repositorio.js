const conexion = require('../configuracion/baseDatos');

// Buscar un servicio activo
async function buscarServicio(cliente, codigo) {

    const resultado = await cliente.query(`
        SELECT codigo, nombre, precio, duracion
        FROM servicios
        WHERE codigo = $1
        AND activo = TRUE
        FOR SHARE
    `, [codigo]);

    return resultado.rows[0] || null;
}

// Buscar y bloquear temporalmente al nutricionista
async function buscarNutricionista(cliente, id) {

    const resultado = await cliente.query(`
        SELECT id, nombre
        FROM nutricionistas
        WHERE id = $1
        AND activo = TRUE
        FOR UPDATE
    `, [id]);

    return resultado.rows[0] || null;
}

// Comprobar si existen horarios superpuestos
async function existeConflicto(cliente, reserva) {

    const resultado = await cliente.query(`
        SELECT id
        FROM reservas
        WHERE nutricionista_id = $1
        AND (
            (
                fecha_reserva + hora_reserva
                <
                ($2::date + $3::time)
                + $4::integer * INTERVAL '1 minute'

                AND

                fecha_reserva + hora_reserva
                + duracion_minutos * INTERVAL '1 minute'
                >
                ($2::date + $3::time)
            )
            OR (
                duracion_minutos IS NULL
                AND fecha_reserva = $2::date
            )
        )
        LIMIT 1
    `, [
        reserva.nutricionista_id,
        reserva.fecha_reserva,
        reserva.hora_reserva,
        reserva.duracion_minutos
    ]);

    return resultado.rowCount > 0;
}

// Guardar una nueva reserva
async function crearReserva(cliente, reserva) {

    const resultado = await cliente.query(`
        INSERT INTO reservas (
            usuario_id,
            nombre_paciente,
            correo,
            codigo_servicio,
            nutricionista_id,
            fecha_reserva,
            hora_reserva,
            duracion_minutos,
            precio,
            estado
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10
        )
        RETURNING *
    `, [
        reserva.usuario_id,
        reserva.nombre_paciente,
        reserva.correo,
        reserva.codigo_servicio,
        reserva.nutricionista_id,
        reserva.fecha_reserva,
        reserva.hora_reserva,
        reserva.duracion_minutos,
        reserva.precio,
        reserva.estado
    ]);

    return resultado.rows[0];
}

// Consultar las reservas de un paciente
async function listarPorUsuario(idUsuario) {

    const resultado = await conexion.query(`
        SELECT r.id,
               r.codigo_servicio,
               s.nombre AS servicio,
               n.nombre AS nutricionista,
               TO_CHAR(
                   r.fecha_reserva, 'YYYY-MM-DD'
               ) AS fecha_reserva,
               LEFT(
                   r.hora_reserva::text, 5
               ) AS hora_reserva,
               r.duracion_minutos,
               r.precio,
               r.estado
        FROM reservas r
        INNER JOIN servicios s
            ON r.codigo_servicio = s.codigo
        INNER JOIN nutricionistas n
            ON r.nutricionista_id = n.id
        WHERE r.usuario_id = $1
        ORDER BY r.fecha_reserva DESC,
                 r.hora_reserva DESC
    `, [idUsuario]);

    return resultado.rows;
}

module.exports = {
    buscarServicio,
    buscarNutricionista,
    existeConflicto,
    crearReserva,
    listarPorUsuario
};
