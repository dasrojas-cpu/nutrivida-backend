const comprobar = require('node:assert/strict');

const permisos = require(
    '../src/seguridad/permisos'
);

// Simular una solicitud y su respuesta
function probarPermiso(usuario) {

    const solicitud = {
        usuario: usuario
    };

    let estado = 200;
    let permitido = false;

    const respuesta = {
        status(codigo) {
            estado = codigo;
            return this;
        },

        json(datos) {
            return datos;
        }
    };

    function siguiente() {
        permitido = true;
    }

    const verificar = permisos.permitirRoles(
        'administrador'
    );

    verificar(solicitud, respuesta, siguiente);

    return {
        estado,
        permitido
    };
}

// Prueba 1: Usuario administrador
const administrador = probarPermiso({
    rol: 'administrador'
});

comprobar.equal(administrador.estado, 200);
comprobar.equal(administrador.permitido, true);

console.log('Administrador autorizado: APROBADO');

// Prueba 2: Usuario paciente
const paciente = probarPermiso({
    rol: 'paciente'
});

comprobar.equal(paciente.estado, 403);
comprobar.equal(paciente.permitido, false);

console.log('Paciente sin permisos: 403 - APROBADO');

// Prueba 3: Usuario sin autenticacion
const sinUsuario = probarPermiso(null);

comprobar.equal(sinUsuario.estado, 401);
comprobar.equal(sinUsuario.permitido, false);

console.log('Usuario sin autenticacion: 401 - APROBADO');

// Prueba 4: Rol desconocido
const desconocido = probarPermiso({
    rol: 'desconocido'
});

comprobar.equal(desconocido.estado, 403);
comprobar.equal(desconocido.permitido, false);

console.log('Rol desconocido: 403 - APROBADO');

console.log('------------------------------');
console.log('Todas las pruebas aprobadas: 4 de 4');
