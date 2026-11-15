const aplicacion = require('../src/aplicacion');
const conexion = require('../src/configuracion/baseDatos');
const comprobar = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

// Datos ficticios para las pruebas
const usuario = {
    nombre: 'Paciente',
    apellido: 'Prueba',
    correo: 'prueba+' + randomUUID() + '@gmail.com',
    contrasena: 'NutrividaPrueba2026!'
};

const servidor = aplicacion.listen(0, '127.0.0.1', async () => {

    const direccion = 'http://127.0.0.1:' +
        servidor.address().port + '/api/auth/register';

    // Enviar una solicitud de registro
    async function enviarRegistro(datos) {
        const respuesta = await fetch(direccion, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        return {
            estado: respuesta.status,
            datos: await respuesta.json()
        };
    }

    try {
        // Prueba 1: Registro correcto
        const registro = await enviarRegistro(usuario);

        comprobar.equal(registro.estado, 201);
        comprobar.equal(registro.datos.usuario.rol, 'paciente');
        comprobar.equal(
            'password_hash' in registro.datos.usuario,
            false
        );

        console.log('Registro correcto: 201 - APROBADO');

        // Prueba 2: Correo duplicado
        const duplicado = await enviarRegistro(usuario);
        comprobar.equal(duplicado.estado, 409);

        console.log('Correo duplicado: 409 - APROBADO');

        // Prueba 3: Datos incompletos
        const incompleto = await enviarRegistro({
            nombre: 'Paciente'
        });

        comprobar.equal(incompleto.estado, 400);

        console.log('Datos incompletos: 400 - APROBADO');

        // Prueba 4: Dominio invalido
        const dominio = await enviarRegistro({
            ...usuario,
            correo: 'paciente@ejemplo.com'
        });

        comprobar.equal(dominio.estado, 400);

        console.log('Dominio invalido: 400 - APROBADO');

        // Prueba 5: Contrasena invalida
        const contrasena = await enviarRegistro({
            ...usuario,
            contrasena: '123'
        });

        comprobar.equal(contrasena.estado, 400);

        console.log('Contrasena invalida: 400 - APROBADO');

        // Prueba 6: Asignacion de rol no permitida
        const administrador = await enviarRegistro({
            ...usuario,
            rol: 'administrador'
        });

        comprobar.equal(administrador.estado, 400);

        console.log('Asignacion de rol: 400 - APROBADO');

        console.log('------------------------------');
        console.log('Todas las pruebas aprobadas: 6 de 6');

    } catch (error) {
        console.error('Error en la prueba:', error.message);
        process.exitCode = 1;
    } finally {
        try {
            // Eliminar solamente el usuario ficticio
            await conexion.query(
                'DELETE FROM usuarios WHERE correo = $1',
                [usuario.correo]
            );
        } finally {
            servidor.close();
            await conexion.end();
        }
    }
});
