const argon2 = require('argon2');

// Configuracion del algoritmo de seguridad
const configuracion = {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
};

// Proteger la contrasena
async function protegerContrasena(contrasena) {
    return await argon2.hash(contrasena, configuracion);
}

// Verificar la contrasena ingresada
async function verificarContrasena(contrasena, hash) {
    return await argon2.verify(hash, contrasena);
}

module.exports = {
    protegerContrasena,
    verificarContrasena
};
