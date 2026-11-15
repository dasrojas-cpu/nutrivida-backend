require('dotenv').config({ quiet: true });

const jwt = require('jsonwebtoken');

const secreto = process.env.JWT_SECRETO;
const algoritmo = 'HS256';
const emisor = 'nutrivida-backend';
const destinatario = 'nutrivida-frontend';
const vigencia = 30 * 60;

if (!secreto || !/^[a-f0-9]{64,}$/i.test(secreto)) {
    throw new Error('Clave JWT no configurada correctamente');
}

// Generar un token de acceso
function generarToken(usuario) {
    return jwt.sign({}, secreto, {
        algorithm: algoritmo,
        subject: String(usuario.id),
        issuer: emisor,
        audience: destinatario,
        expiresIn: vigencia
    });
}

// Verificar la autenticidad y vigencia del token
function verificarToken(token) {
    const datos = jwt.verify(token, secreto, {
        algorithms: [algoritmo],
        issuer: emisor,
        audience: destinatario
    });

    if (!datos ||
        typeof datos.sub !== 'string' ||
        !/^[1-9][0-9]*$/.test(datos.sub) ||
        !Number.isInteger(datos.exp)) {
        throw new Error('Token invalido');
    }

    return datos;
}

module.exports = {
    generarToken,
    verificarToken,
    vigencia
};
