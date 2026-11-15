const aplicacion = require('../src/aplicacion');
const conexion = require('../src/configuracion/baseDatos');
const comprobar = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const identificador = randomUUID()
    .replace(/-/g, '')
    .slice(0, 16);

// Datos ficticios para las pruebas
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
    descripcion: 'Servicio ficticio para pruebas'
};

const servidor = aplicacion.listen(0, '127.0.0.1', async () => {

    const direccion = 'http://127.0.0.1:' +
        servidor.address().port;

    const rutaServicio = '/api/servicios/' +
        servicio.codigo;

    // Enviar solicitudes HTTP
    async function enviar(ruta, metodo, datos, token) {

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
            datos: respuesta.status === 204
                ? null
                : await respuesta.json()
        };
    }

    // Registrar una cuenta ficticia
    async function registrar(usuario) {
        const resultado = await enviar(
            '/api/auth/register',
            'POST',
            usuario
        );

        comprobar.equal(resultado.estado, 201);

        return resultado.datos.usuario;
    }

    // Obtener un token de acceso
    async function iniciarSesion(usuario) {
        const resultado = await enviar(
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

        // Asignar rol al administrador ficticio
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

        const tokenAdmin = await iniciarSesion(administrador);

        // Crear un servicio ficticio
        const creado = await enviar(
            '/api/servicios',
            'POST',
            servicio,
            tokenAdmin
        );

        comprobar.equal(creado.estado, 201);

        const datosActualizados = {
            ...servicio,
            nombre: 'Servicio actualizado',
            precio: 20000
        };

        // Prueba 1: Eliminar sin token
        const sinToken = await enviar(
            rutaServicio,
            'DELETE'
        );

        comprobar.equal(sinToken.estado, 401);

        console.log('Eliminar sin token: 401 - APROBADO');

        // Prueba 2: Modificar como paciente
        const modificarPaciente = await enviar(
            rutaServicio,
            'PUT',
            datosActualizados,
            tokenPaciente
        );

        comprobar.equal(modificarPaciente.estado, 403);

        console.log('Modificar como paciente: 403 - APROBADO');

        // Prueba 3: Eliminar como paciente
        const eliminarPaciente = await enviar(
            rutaServicio,
            'DELETE',
            null,
            tokenPaciente
        );

        comprobar.equal(eliminarPaciente.estado, 403);

        console.log('Eliminar como paciente: 403 - APROBADO');

        // Prueba 4: Cambiar el codigo
        const codigoInvalido = await enviar(
            rutaServicio,
            'PUT',
            {
                ...datosActualizados,
                codigo: 'OTROCODIGO'
            },
            tokenAdmin
        );

        comprobar.equal(codigoInvalido.estado, 400);

        console.log('Cambio de codigo: 400 - APROBADO');

        // Prueba 5: Actualizar como administrador
        const actualizado = await enviar(
            rutaServicio,
            'PUT',
            datosActualizados,
            tokenAdmin
        );

        comprobar.equal(actualizado.estado, 200);
        comprobar.equal(
            actualizado.datos.servicio.precio,
            20000
        );

        const consulta = await enviar(
            rutaServicio,
            'GET'
        );

        comprobar.equal(consulta.estado, 200);
        comprobar.equal(consulta.datos.precio, 20000);
        comprobar.equal(
            consulta.datos.nombre,
            'Servicio actualizado'
        );

        console.log('Servicio actualizado: 200 - APROBADO');

        // Prueba 6: Eliminar como administrador
        const eliminado = await enviar(
            rutaServicio,
            'DELETE',
            null,
            tokenAdmin
        );

        comprobar.equal(eliminado.estado, 204);

        console.log('Servicio eliminado: 204 - APROBADO');

        // Prueba 7: Consultar servicio desactivado
        const desactivado = await enviar(
            rutaServicio,
            'GET'
        );

        comprobar.equal(desactivado.estado, 404);

        console.log('Servicio no disponible: 404 - APROBADO');

        // Prueba 8: Comprobar eliminacion logica
        const resultado = await conexion.query(`
            SELECT codigo, activo, precio
            FROM servicios
            WHERE codigo = $1
        `, [servicio.codigo]);

        comprobar.equal(resultado.rowCount, 1);
        comprobar.equal(resultado.rows[0].activo, false);
        comprobar.equal(resultado.rows[0].precio, 20000);

        console.log('Eliminacion logica: APROBADO');

        // Prueba 9: Eliminar nuevamente
        const repetido = await enviar(
            rutaServicio,
            'DELETE',
            null,
            tokenAdmin
        );

        comprobar.equal(repetido.estado, 404);

        console.log('Eliminacion repetida: 404 - APROBADO');

        console.log('------------------------------');
        console.log('Todas las pruebas aprobadas: 9 de 9');

    } catch (error) {

        console.error('Error en la prueba:', error.message);
        process.exitCode = 1;

    } finally {

        try {
            // Limpiar solamente los datos ficticios
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
