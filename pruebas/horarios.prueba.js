const comprobar = require('node:assert/strict');

const validacion = require(
    '../src/validaciones/reservas.validacion'
);

const horarios = require(
    '../src/servicios/horarios.servicio'
);

// Fecha ficticia para obtener pruebas reproducibles
const ahora = new Date('2026-11-16T12:00:00Z');

const reserva = {
    codigo_servicio: 'CN001',
    nutricionista_id: 1,
    fecha_reserva: '2026-11-16',
    hora_reserva: '10:30'
};

// Prueba 1: Datos correctos
comprobar.equal(
    validacion.validarReserva(reserva),
    null
);

console.log('Datos correctos: APROBADO');

// Prueba 2: Fecha inexistente
comprobar.notEqual(
    validacion.validarReserva({
        ...reserva,
        fecha_reserva: '2026-02-30'
    }),
    null
);

console.log('Fecha inexistente rechazada: APROBADO');

// Prueba 3: Hora invalida
comprobar.notEqual(
    validacion.validarReserva({
        ...reserva,
        hora_reserva: '10:15'
    }),
    null
);

console.log('Hora invalida rechazada: APROBADO');

// Prueba 4: Horario permitido
comprobar.equal(
    horarios.validarHorario(
        '2026-11-16', '10:30', ahora
    ),
    null
);

console.log('Horario permitido: APROBADO');

// Prueba 5: Fecha pasada
comprobar.notEqual(
    horarios.validarHorario(
        '2026-11-13', '10:00', ahora
    ),
    null
);

console.log('Fecha pasada rechazada: APROBADO');

// Prueba 6: Hora pasada
comprobar.notEqual(
    horarios.validarHorario(
        '2026-11-16', '08:30', ahora
    ),
    null
);

console.log('Hora pasada rechazada: APROBADO');

// Prueba 7: Fin de semana
comprobar.notEqual(
    horarios.validarHorario(
        '2026-11-21', '10:00', ahora
    ),
    null
);

console.log('Fin de semana rechazado: APROBADO');

// Prueba 8: Horario de cierre del viernes
comprobar.notEqual(
    horarios.validarHorario(
        '2026-11-20', '13:30', ahora
    ),
    null
);

console.log('Horario del viernes: APROBADO');

// Prueba 9: Manipulacion del precio
comprobar.notEqual(
    validacion.validarReserva({
        ...reserva,
        precio: 1
    }),
    null
);

console.log('Manipulacion del precio rechazada: APROBADO');

// Prueba 10: Manipulacion de identidad
comprobar.notEqual(
    validacion.validarReserva({
        ...reserva,
        usuario_id: 99
    }),
    null
);

console.log('Manipulacion de identidad rechazada: APROBADO');

console.log('------------------------------');
console.log('Todas las pruebas aprobadas: 10 de 10');
