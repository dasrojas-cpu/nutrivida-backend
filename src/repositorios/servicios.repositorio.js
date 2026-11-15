const conexion = require('../configuracion/baseDatos');

// Consulta base del catalogo
const consultaBase = `
    SELECT s.codigo, c.nombre AS tipo,
           s.nombre, s.duracion, s.modalidad,
           s.profesional, s.precio, s.descripcion
    FROM servicios s
    INNER JOIN categorias c
        ON s.categoria_id = c.id
    WHERE s.activo = TRUE
`;

// Obtener todos los servicios activos
async function listarServicios() {
    const resultado = await conexion.query(
        consultaBase + ' ORDER BY s.codigo'
    );

    return resultado.rows;
}

// Buscar un servicio por su codigo
async function buscarPorCodigo(codigo) {
    const resultado = await conexion.query(
        consultaBase + ' AND s.codigo = $1',
        [codigo]
    );

    return resultado.rows[0] || null;
}

module.exports = {
    listarServicios,
    buscarPorCodigo
};
