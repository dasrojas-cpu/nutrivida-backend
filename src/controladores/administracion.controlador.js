const servicio = require(
    '../servicios/administracion.servicio'
);

const validacion = require(
    '../validaciones/servicios.validacion'
);

const { validarCodigo } = require(
    '../validaciones/codigoServicio.validacion'
);

// Crear un servicio
async function crear(solicitud, respuesta) {
    const error = validacion.validarServicio(
        solicitud.body
    );

    if (error) {
        return respuesta.status(400).json({
            mensaje: error
        });
    }

    const resultado = await servicio.crearServicio(
        solicitud.body
    );

    if (resultado.error === 'categoria') {
        return respuesta.status(400).json({
            mensaje: 'La categoria no existe'
        });
    }

    if (resultado.error === 'duplicado') {
        return respuesta.status(409).json({
            mensaje: 'El codigo del servicio ya existe'
        });
    }

    respuesta.status(201).json({
        mensaje: 'Servicio creado correctamente',
        servicio: resultado.servicio
    });
}

// Actualizar un servicio
async function actualizar(solicitud, respuesta) {
    const codigo = solicitud.params.codigo;

    const error = validacion.validarServicio(
        solicitud.body
    );

    if (error) {
        return respuesta.status(400).json({
            mensaje: error
        });
    }

    if (!validarCodigo(codigo) ||
        codigo !== solicitud.body.codigo) {
        return respuesta.status(400).json({
            mensaje: 'No se puede modificar el codigo'
        });
    }

    const resultado = await servicio.actualizarServicio(
        solicitud.body
    );

    if (resultado.error === 'categoria') {
        return respuesta.status(400).json({
            mensaje: 'La categoria no existe'
        });
    }

    if (resultado.error === 'noEncontrado') {
        return respuesta.status(404).json({
            mensaje: 'Servicio no encontrado'
        });
    }

    respuesta.status(200).json({
        mensaje: 'Servicio actualizado correctamente',
        servicio: resultado.servicio
    });
}

// Desactivar un servicio
async function eliminar(solicitud, respuesta) {
    const codigo = solicitud.params.codigo;

    if (!validarCodigo(codigo)) {
        return respuesta.status(400).json({
            mensaje: 'Codigo invalido'
        });
    }

    const eliminado = await servicio.desactivarServicio(
        codigo
    );

    if (!eliminado) {
        return respuesta.status(404).json({
            mensaje: 'Servicio no encontrado'
        });
    }

    respuesta.status(204).end();
}

module.exports = {
    crear,
    actualizar,
    eliminar
};
