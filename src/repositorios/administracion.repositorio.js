const conexion = require('../configuracion/baseDatos');

// Buscar una categoria existente
async function buscarCategoria(nombre) {
    const resultado = await conexion.query(`
        SELECT id, nombre
        FROM categorias
        WHERE nombre = $1
    `, [nombre]);

    return resultado.rows[0] || null;
}

// Crear un servicio
async function crearServicio(datos, categoria) {
    const resultado = await conexion.query(`
        INSERT INTO servicios (
            codigo, categoria_id, nombre,
            duracion, modalidad, profesional,
            precio, descripcion
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (codigo) DO NOTHING
        RETURNING codigo, nombre, duracion,
                  modalidad, profesional,
                  precio, descripcion
    `, [
        datos.codigo,
        categoria.id,
        datos.nombre,
        datos.duracion,
        datos.modalidad,
        datos.profesional,
        datos.precio,
        datos.descripcion
    ]);

    const servicio = resultado.rows[0];

    return servicio
        ? { ...servicio, tipo: categoria.nombre }
        : null;
}

// Actualizar un servicio activo
async function actualizarServicio(datos, categoria) {
    const resultado = await conexion.query(`
        UPDATE servicios
        SET categoria_id = $2,
            nombre = $3,
            duracion = $4,
            modalidad = $5,
            profesional = $6,
            precio = $7,
            descripcion = $8
        WHERE codigo = $1 AND activo = TRUE
        RETURNING codigo, nombre, duracion,
                  modalidad, profesional,
                  precio, descripcion
    `, [
        datos.codigo,
        categoria.id,
        datos.nombre,
        datos.duracion,
        datos.modalidad,
        datos.profesional,
        datos.precio,
        datos.descripcion
    ]);

    const servicio = resultado.rows[0];

    return servicio
        ? { ...servicio, tipo: categoria.nombre }
        : null;
}

// Desactivar un servicio sin eliminar su historial
async function desactivarServicio(codigo) {
    const resultado = await conexion.query(`
        UPDATE servicios
        SET activo = FALSE
        WHERE codigo = $1 AND activo = TRUE
    `, [codigo]);

    return resultado.rowCount > 0;
}

module.exports = {
    buscarCategoria,
    crearServicio,
    actualizarServicio,
    desactivarServicio
};
