// Representar los datos del catalogo
function representarServicio(datos) {
    return {
        codigo: datos.codigo,
        tipo: datos.tipo,
        nombre: datos.nombre,
        duracion: datos.duracion,
        modalidad: datos.modalidad,
        profesional: datos.profesional,
        precio: datos.precio,
        descripcion: datos.descripcion
    };
}

module.exports = {
    representarServicio
};
