const aplicacion = require('../src/aplicacion');
const conexion = require('../src/configuracion/baseDatos');
const tokens = require('../src/seguridad/tokens');
const comprobar = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

// Usuario ficticio para las pruebas
const usuario = {
    nombre: 'Paciente',
    apellido: 'Prueba',
    correo: 'login.' + randomUUID() + '@gmail.com',
    contrasena: 'NutrividaPrueba2026!'
};

const servidor = aplicacion.listen(0, '127.0.0.1', async () => {

    const direccion = 'http://127.0.0.1:' +
        servidor.address().port + '/api/auth';

    // Enviar solicitudes HTTP
    async function enviarSolicitud(ruta, datos) {
        const respuesta = await fetch(direccion + ruta, {
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

    const credenciales = {
        correo: usuario.correo,
        contrasena: usuario.contrasena
    };

    try {

        // Registrar usuario de prueba
        const registro = await enviarSolicitud(
            '/register', usuario
        );

        comprobar.equal(registro.estado, 201);

        // Prueba 1: Inicio de sesion correcto
        const correcto = await enviarSolicitud(
            '/login', credenciales
        );

        comprobar.equal(correcto.estado, 200);
        comprobar.equal(correcto.datos.tokenType, 'Bearer');
        comprobar.equal(correcto.datos.expiresIn, 1800);
        comprobar.equal(correcto.datos.usuario.rol, 'paciente');

        const identidad = tokens.verificarToken(
            correcto.datos.accessToken
        );

        comprobar.equal(
            identidad.sub,
            String(registro.datos.usuario.id)
        );

        comprobar.equal(
            'password_hash' in correcto.datos.usuario,
            false
        );

        console.log('Inicio de sesion correcto: 200 - APROBADO');
        console.log('JWT generado y verificado correctamente');

        // Prueba 2: Contrasena incorrecta
        const incorrecto = await enviarSolicitud(
            '/login',
            {
                ...credenciales,
                contrasena: 'ClaveIncorrecta'
            }
        );

        comprobar.equal(incorrecto.estado, 401);

        console.log('Contrasena incorrecta: 401 - APROBADO');

        // Prueba 3: Usuario inexistente
        const inexistente = await enviarSolicitud(
            '/login',
            {
                ...credenciales,
                correo: randomUUID() + '@gmail.com'
            }
        );

        comprobar.equal(inexistente.estado, 401);

        comprobar.equal(
            inexistente.datos.mensaje,
            incorrecto.datos.mensaje
        );

        console.log('Usuario inexistente: 401 - APROBADO');

        // Deshabilitar solamente la cuenta ficticia
        await conexion.query(`
            UPDATE usuarios
            SET activo = FALSE
            WHERE correo = $1
        `, [usuario.correo]);

        // Prueba 4: Cuenta deshabilitada
        const deshabilitado = await enviarSolicitud(
            '/login', credenciales
        );

        comprobar.equal(deshabilitado.estado, 401);

        comprobar.equal(
            deshabilitado.datos.mensaje,
            incorrecto.datos.mensaje
        );

        console.log('Cuenta deshabilitada: 401 - APROBADO');

        // Prueba 5: Campos incompletos
        const incompleto = await enviarSolicitud(
            '/login',
            {
                correo: usuario.correo
            }
        );

        comprobar.equal(incompleto.estado, 400);

        console.log('Campos incompletos: 400 - APROBADO');

        // Prueba 6: Limite de intentos
        const limite = await enviarSolicitud(
            '/login', credenciales
        );

        comprobar.equal(limite.estado, 429);

        console.log('Limite de intentos: 429 - APROBADO');

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
