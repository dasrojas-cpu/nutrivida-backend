const repositorio = require(
    '../repositorios/administracion.repositorio'
);

const modelo = require(
    '../modelos/servicios.modelo'
);

// Preparar los datos recibidos
function prepararServicio(datos) {
    return {
        codigo: datos.codigo,
        nombre: datos.nombre.trim(),
        duracion: datos.duracion.trim(),
        modalidad: datos.modalidad.trim(),
        profesional: datos.profesional.trim(),
        precio: datos.precio,
        descripcion: datos.descripcion.trim()
    };
}

// Crear un servicio
async function crearServicio(datos) {
    const categoria = await repositorio.buscarCategoria(
        datos.tipo.trim()
    );

    if (!categoria) {
        return { error: 'categoria' };
    }

    const resultado = await repositorio.crearServicio(
        prepararServicio(datos),
        categoria
    );

    if (!resultado) {
        return { error: 'duplicado' };
    }

    return {
        servicio: modelo.representarServicio(resultado)
    };
}

// Actualizar un servicio
async function actualizarServicio(datos) {
    const categoria = await repositorio.buscarCategoria(
        datos.tipo.trim()
    );

    if (!categoria) {
        return { error: 'categoria' };
    }

    const resultado = await repositorio.actualizarServicio(
        prepararServicio(datos),
        categoria
    );

    if (!resultado) {
        return { error: 'noEncontrado' };
    }

    return {
        servicio: modelo.representarServicio(resultado)
    };
}

// Desactivar un servicio
async function desactivarServicio(codigo) {
    return repositorio.desactivarServicio(codigo);
}

module.exports = {
    crearServicio,
    actualizarServicio,
    desactivarServicio
};
