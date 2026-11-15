const servicio = require(
    '../servicios/servicios.servicio'
);

// Mostrar el catalogo
async function listar(solicitud, respuesta) {
    const servicios = await servicio.obtenerServicios();

    respuesta.status(200).json(servicios);
}

// Mostrar el detalle
async function buscar(solicitud, respuesta) {
    const codigo = solicitud.params.codigo;

    if (!codigo.trim() || codigo.length > 20) {
        return respuesta.status(400).json({
            mensaje: 'Codigo de servicio invalido'
        });
    }

    const resultado = await servicio.obtenerServicio(codigo);

    if (!resultado) {
        return respuesta.status(404).json({
            mensaje: 'Servicio no encontrado'
        });
    }

    respuesta.status(200).json(resultado);
}

module.exports = {
    listar,
    buscar
};
