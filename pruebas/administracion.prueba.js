const aplicacion = require('../src/aplicacion');
const conexion = require('../src/configuracion/baseDatos');
const comprobar = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

// Generar datos ficticios
const identificador = randomUUID()
    .replace(/-/g, '')
    .slice(0, 16);

const paciente = {
    nombre: 'Paciente',
    apellido: 'Prueba',
    correo: 'paciente.' + identificador + '@gmail.com',
    contrasena: 'NutrividaPrueba2026!'
};

const administrador = {
    nombre: 'Administrador',
    apellido: 'Prueba',
    correo: 'admin.' + identificador + '@gmail.com',
    contrasena: 'NutrividaPrueba2026!'
};

const servicio = {
    codigo: 'PR' + identificador.toUpperCase(),
    tipo: 'Consulta',
    nombre: 'Servicio de prueba',
    duracion: '30 min',
    modalidad: 'Presencial',
    profesional: 'Nutricionista',
    precio: 15000,
    descripcion: 'Servicio ficticio para pruebas del sistema'
};

const servidor = aplicacion.listen(0, '127.0.0.1', async () => {

    const direccion = 'http://127.0.0.1:' +
        servidor.address().port;

    // Enviar solicitudes a la API
    async function enviarSolicitud(ruta, metodo, datos, token) {

        const encabezados = {
            'Content-Type': 'application/json'
        };

        if (token) {
            encabezados.Authorization = 'Bearer ' + token;
        }

        const respuesta = await fetch(direccion + ruta, {
            method: metodo,
            headers: encabezados,
            body: datos ? JSON.stringify(datos) : undefined
        });

        return {
            estado: respuesta.status,
            datos: await respuesta.json()
        };
    }

    // Registrar un usuario ficticio
    async function registrar(usuario) {

        const resultado = await enviarSolicitud(
            '/api/auth/register',
            'POST',
            usuario
        );

        comprobar.equal(resultado.estado, 201);

        return resultado.datos.usuario;
    }

    // Obtener el token de un usuario
    async function iniciarSesion(usuario) {

        const resultado = await enviarSolicitud(
            '/api/auth/login',
            'POST',
            {
                correo: usuario.correo,
                contrasena: usuario.contrasena
            }
        );

        comprobar.equal(resultado.estado, 200);

        return resultado.datos.accessToken;
    }

    try {

        await registrar(paciente);
        const cuentaAdmin = await registrar(administrador);

        // Asignar rol solamente al administrador ficticio
        await conexion.query(`
            UPDATE usuarios
            SET rol_id = (
                SELECT id FROM roles
                WHERE nombre = 'administrador'
            )
            WHERE id = $1 AND correo = $2
        `, [
            cuentaAdmin.id,
            administrador.correo
        ]);

        const tokenPaciente = await iniciarSesion(paciente);

        const tokenAdmin = await iniciarSesion(
            administrador
        );

        // Prueba 1: Solicitud sin autenticacion
        const sinToken = await enviarSolicitud(
            '/api/servicios',
            'POST',
            servicio
        );

        comprobar.equal(sinToken.estado, 401);

        console.log('Solicitud sin token: 401 - APROBADO');

        // Prueba 2: Paciente sin permisos
        const sinPermisos = await enviarSolicitud(
            '/api/servicios',
            'POST',
            servicio,
            tokenPaciente
        );

        comprobar.equal(sinPermisos.estado, 403);

        console.log('Paciente sin permisos: 403 - APROBADO');

        // Prueba 3: Precio invalido
        const precioInvalido = await enviarSolicitud(
            '/api/servicios',
            'POST',
            {
                ...servicio,
                precio: -5000
            },
            tokenAdmin
        );

        comprobar.equal(precioInvalido.estado, 400);

        console.log('Precio invalido: 400 - APROBADO');

        // Prueba 4: Categoria inexistente
        const categoriaInvalida = await enviarSolicitud(
            '/api/servicios',
            'POST',
            {
                ...servicio,
                tipo: 'Categoria inexistente'
            },
            tokenAdmin
        );

        comprobar.equal(categoriaInvalida.estado, 400);

        console.log('Categoria inexistente: 400 - APROBADO');

        // Prueba 5: Crear servicio como administrador
        const creado = await enviarSolicitud(
            '/api/servicios',
            'POST',
            servicio,
            tokenAdmin
        );

        comprobar.equal(creado.estado, 201);

        comprobar.equal(
            creado.datos.servicio.codigo,
            servicio.codigo
        );

        console.log('Servicio creado: 201 - APROBADO');

        // Prueba 6: Servicio duplicado
        const duplicado = await enviarSolicitud(
            '/api/servicios',
            'POST',
            servicio,
            tokenAdmin
        );

        comprobar.equal(duplicado.estado, 409);

        console.log('Servicio duplicado: 409 - APROBADO');

        // Prueba 7: Consultar el servicio creado
        const consulta = await enviarSolicitud(
            '/api/servicios/' + servicio.codigo,
            'GET'
        );

        comprobar.equal(consulta.estado, 200);
        comprobar.equal(consulta.datos.precio, 15000);
        comprobar.equal(consulta.datos.nombre, servicio.nombre);

        console.log('Servicio almacenado: 200 - APROBADO');

        console.log('------------------------------');
        console.log('Todas las pruebas aprobadas: 7 de 7');

    } catch (error) {

        console.error('Error en la prueba:', error.message);
        process.exitCode = 1;

    } finally {

        try {
            // Eliminar solamente los datos ficticios
            await conexion.query(
                'DELETE FROM servicios WHERE codigo = $1',
                [servicio.codigo]
            );

            await conexion.query(`
                DELETE FROM usuarios
                WHERE correo IN ($1, $2)
            `, [
                paciente.correo,
                administrador.correo
            ]);

        } finally {
            servidor.close();
            await conexion.end();
        }
    }
});
