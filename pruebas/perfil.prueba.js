const aplicacion = require('../src/aplicacion');
const conexion = require('../src/configuracion/baseDatos');
const comprobar = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

// Crear datos ficticios
const usuario = {
    nombre: 'Paciente',
    apellido: 'Prueba',
    correo: 'perfil.' + randomUUID() + '@gmail.com',
    contrasena: 'NutrividaPrueba2026!'
};

const servidor = aplicacion.listen(0, '127.0.0.1', async () => {

    const direccion = 'http://127.0.0.1:' +
        servidor.address().port + '/api/auth';

    // Enviar solicitudes de autenticacion
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

    // Consultar el perfil
    async function consultarPerfil(token, parametros = '') {
        const encabezados = {};

        if (token) {
            encabezados.Authorization = 'Bearer ' + token;
        }

        const respuesta = await fetch(
            direccion + '/me' + parametros,
            {
                headers: encabezados
            }
        );

        return {
            estado: respuesta.status,
            datos: await respuesta.json()
        };
    }

    try {

        // Registrar usuario ficticio
        const registro = await enviarSolicitud(
            '/register', usuario
        );

        comprobar.equal(registro.estado, 201);

        const idUsuario = registro.datos.usuario.id;

        // Iniciar sesion
        const acceso = await enviarSolicitud('/login', {
            correo: usuario.correo,
            contrasena: usuario.contrasena
        });

        comprobar.equal(acceso.estado, 200);

        const token = acceso.datos.accessToken;

        // Prueba 1: Token valido
        const valido = await consultarPerfil(token);

        comprobar.equal(valido.estado, 200);
        comprobar.equal(valido.datos.usuario.id, idUsuario);
        comprobar.equal(valido.datos.usuario.rol, 'paciente');

        comprobar.equal(
            'password_hash' in valido.datos.usuario,
            false
        );

        comprobar.equal(
            'hash' in valido.datos.usuario,
            false
        );

        console.log('Token valido: 200 - APROBADO');

        // Prueba 2: Solicitud sin token
        const sinToken = await consultarPerfil();

        comprobar.equal(sinToken.estado, 401);

        console.log('Solicitud sin token: 401 - APROBADO');

        // Prueba 3: Token invalido
        const invalido = await consultarPerfil(
            'token-invalido'
        );

        comprobar.equal(invalido.estado, 401);

        console.log('Token invalido: 401 - APROBADO');

        // Prueba 4: Token alterado
        const partes = token.split('.');

        partes[2] =
            (partes[2][0] === 'A' ? 'B' : 'A')
            + partes[2].slice(1);

        const alterado = await consultarPerfil(
            partes.join('.')
        );

        comprobar.equal(alterado.estado, 401);

        console.log('Token alterado: 401 - APROBADO');

        // Prueba 5: Token vencido
        const tokenVencido = jwt.sign(
            {},
            process.env.JWT_SECRETO,
            {
                algorithm: 'HS256',
                subject: String(idUsuario),
                issuer: 'nutrivida-backend',
                audience: 'nutrivida-frontend',
                expiresIn: -10
            }
        );

        const vencido = await consultarPerfil(
            tokenVencido
        );

        comprobar.equal(vencido.estado, 401);

        console.log('Token vencido: 401 - APROBADO');

        // Prueba 6: Intento de cambiar la identidad
        const otraIdentidad = await consultarPerfil(
            token,
            '?id=' + (idUsuario + 1)
        );

        comprobar.equal(otraIdentidad.estado, 200);

        comprobar.equal(
            otraIdentidad.datos.usuario.id,
            idUsuario
        );

        console.log('Identidad protegida: APROBADO');

        // Prueba 7: Deshabilitar la cuenta ficticia
        await conexion.query(`
            UPDATE usuarios
            SET activo = FALSE
            WHERE id = $1 AND correo = $2
        `, [idUsuario, usuario.correo]);

        const deshabilitado = await consultarPerfil(token);

        comprobar.equal(deshabilitado.estado, 401);

        console.log('Cuenta deshabilitada: 401 - APROBADO');

        console.log('------------------------------');
        console.log('Todas las pruebas aprobadas: 7 de 7');

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
