const repositorio = require('../repositorios/nutricionistas.repositorio');

async function listarNutricionistas() {
    return repositorio.listarNutricionistas();
}

module.exports = { listarNutricionistas };
