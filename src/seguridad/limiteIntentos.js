const { rateLimit } = require('express-rate-limit');

// Limitar las solicitudes de registro
const limiteRegistro = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        mensaje: 'Demasiados intentos de registro'
    }
});

// Limitar los intentos de inicio de sesion
const limiteInicioSesion = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        mensaje: 'Demasiados intentos. Intente nuevamente en 15 minutos'
    }
});

module.exports = {
    limiteRegistro,
    limiteInicioSesion
};
