const repositorio = require(
    '../repositorios/servicios.repositorio'
);

const modelo = require(
    '../modelos/servicios.modelo'
);

// Obtener el catalogo disponible
async function obtenerServicios() {
    const servicios = await repositorio.listarServicios();

    return servicios.map(modelo.representarServicio);
}

// Obtener el detalle de un servicio
async function obtenerServicio(codigo) {
    const servicio = await repositorio.buscarPorCodigo(codigo);

    if (!servicio) {
        return null;
    }

    return modelo.representarServicio(servicio);
}

module.exports = {
    obtenerServicios,
    obtenerServicio
};
