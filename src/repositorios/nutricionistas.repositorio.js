const conexion = require('../configuracion/baseDatos');

async function listarNutricionistas() {
    const resultado = await conexion.query(`
        SELECT id, nombre
        FROM nutricionistas
        WHERE activo = TRUE
        ORDER BY id
    `);

    return resultado.rows;
}

module.exports = { listarNutricionistas };
