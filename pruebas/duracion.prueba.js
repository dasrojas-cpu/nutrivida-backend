const comprobar = require('node:assert/strict');

const duracion = require(
    '../src/servicios/duracion.servicio'
);

// Prueba 1: Consulta de 50 minutos
comprobar.equal(
    duracion.obtenerDuracionMinutos({
        codigo: 'CN001',
        duracion: '50 min'
    }),
    50
);

console.log('Consulta de 50 minutos: APROBADO');

// Prueba 2: Consulta de 30 minutos
comprobar.equal(
    duracion.obtenerDuracionMinutos({
        codigo: 'CN002',
        duracion: '30 min'
    }),
    30
);

console.log('Consulta de 30 minutos: APROBADO');

// Prueba 3: Plan nutricional
comprobar.equal(
    duracion.obtenerDuracionMinutos({
        codigo: 'PL001',
        duracion: '—'
    }),
    50
);

console.log('Duracion de plan nutricional: APROBADO');

// Prueba 4: Duracion incorrecta
comprobar.equal(
    duracion.obtenerDuracionMinutos({
        codigo: 'CN001',
        duracion: 'invalida'
    }),
    null
);

console.log('Duracion invalida rechazada: APROBADO');

// Prueba 5: Consulta dentro del horario
comprobar.equal(
    duracion.validarHoraTermino(
        '2026-11-16', '16:00', 50
    ),
    true
);

console.log('Hora de termino correcta: APROBADO');

// Prueba 6: Consulta despues del cierre
comprobar.equal(
    duracion.validarHoraTermino(
        '2026-11-16', '16:30', 50
    ),
    false
);

console.log('Cierre de lunes a jueves: APROBADO');

// Prueba 7: Horario del viernes
comprobar.equal(
    duracion.validarHoraTermino(
        '2026-11-20', '12:30', 50
    ),
    false
);

console.log('Cierre del viernes: APROBADO');

console.log('------------------------------');
console.log('Todas las pruebas aprobadas: 7 de 7');
