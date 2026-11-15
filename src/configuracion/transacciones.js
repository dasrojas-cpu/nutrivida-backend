const conexion = require('./baseDatos');

// Ejecutar una operacion dentro de una transaccion
async function ejecutarTransaccion(operacion) {

    const cliente = await conexion.connect();

    try {
        await cliente.query('BEGIN');

        const resultado = await operacion(cliente);

        await cliente.query('COMMIT');

        return resultado;

    } catch (error) {
        await cliente.query('ROLLBACK');
        throw error;

    } finally {
        cliente.release();
    }
}

module.exports = {
    ejecutarTransaccion
};
