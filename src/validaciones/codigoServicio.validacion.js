// Comprobar el formato del codigo
function validarCodigo(codigo) {
    return typeof codigo === 'string' &&
        /^[A-Z0-9]{1,20}$/.test(codigo);
}

module.exports = {
    validarCodigo
};
