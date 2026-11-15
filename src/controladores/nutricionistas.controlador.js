const servicio = require('../servicios/nutricionistas.servicio');

async function listar(solicitud, respuesta) {
    const nutricionistas = await servicio.listarNutricionistas();

    respuesta.status(200).json(nutricionistas);
}

module.exports = { listar };
