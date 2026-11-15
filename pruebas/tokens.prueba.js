const comprobar = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const seguridad = require('../src/seguridad/tokens');

// Usuario ficticio
const usuario = {
    id: 1
};

// Prueba 1: Generar y verificar un token
const token = seguridad.generarToken(usuario);
const datos = seguridad.verificarToken(token);

comprobar.equal(datos.sub, '1');

console.log('Token valido: APROBADO');

// Prueba 2: Comprobar vigencia
comprobar.equal(datos.exp - datos.iat, 1800);

console.log('Vigencia de 30 minutos: APROBADO');

// Prueba 3: Rechazar token alterado
const partes = token.split('.');

partes[2] = (partes[2][0] === 'A' ? 'B' : 'A')
    + partes[2].slice(1);

comprobar.throws(() => {
    seguridad.verificarToken(partes.join('.'));
});

console.log('Token alterado rechazado: APROBADO');

// Prueba 4: Rechazar token vencido
const tokenVencido = jwt.sign(
    {},
    process.env.JWT_SECRETO,
    {
        algorithm: 'HS256',
        subject: '1',
        issuer: 'nutrivida-backend',
        audience: 'nutrivida-frontend',
        expiresIn: -10
    }
);

comprobar.throws(() => {
    seguridad.verificarToken(tokenVencido);
}, { name: 'TokenExpiredError' });

console.log('Token vencido rechazado: APROBADO');

// Prueba 5: Rechazar token incorrecto
comprobar.throws(() => {
    seguridad.verificarToken('token-invalido');
});

console.log('Token invalido rechazado: APROBADO');

console.log('------------------------------');
console.log('Todas las pruebas aprobadas: 5 de 5');
