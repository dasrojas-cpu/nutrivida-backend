const aplicacion = require('../src/aplicacion');
const conexion = require('../src/configuracion/baseDatos');
const horarios = require('../src/servicios/horarios.servicio');
const comprobar = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const identificador = randomUUID();

// Generar pacientes ficticios
function prepararPaciente(numero) {
    return {
        nombre: 'Paciente',
        apellido: 'Prueba',
        correo: 'reserva.' + numero + '.' +
            identificador + '@gmail.com',
        contrasena: 'NutrividaPrueba2026!'
    };
}

const pacienteUno = prepararPaciente(1);
const pacienteDos = prepararPaciente(2);

// Obtener una fecha futura de lunes
function obtenerFechaPrueba() {
    const actual = horarios.obtenerFechaHoraActual();

    const fecha = new Date(
        actual.fecha + 'T00:00:00Z'
    );

    fecha.setUTCDate(fecha.getUTCDate() + 7);

    while (fecha.getUTCDay() !== 1) {
        fecha.setUTCDate(fecha.getUTCDate() + 1);
    }

    return fecha.toISOString().slice(0, 10);
}

// Iniciar un servidor local para las pruebas
const servidor = aplicacion.listen(
    0, '127.0.0.1', ejecutarPruebas
);

// Enviar solicitudes HTTP
async function enviarSolicitud(
    ruta, metodo, datos, token
) {
    const direccion = 'http://127.0.0.1:' +
        servidor.address().port;

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

// Registrar e iniciar sesion
async function prepararCuenta(paciente) {

    const registro = await enviarSolicitud(
        '/api/auth/register',
        'POST',
        paciente
    );

    comprobar.equal(registro.estado, 201);

    const acceso = await enviarSolicitud(
        '/api/auth/login',
        'POST',
        {
            correo: paciente.correo,
            contrasena: paciente.contrasena
        }
    );

    comprobar.equal(acceso.estado, 200);

    return {
        id: registro.datos.usuario.id,
        token: acceso.datos.accessToken
    };
}

// Crear una reserva mediante la API
async function agendar(datos, token) {
    return enviarSolicitud(
        '/api/reservas',
        'POST',
        datos,
        token
    );
}

// Crear un nutricionista ficticio
async function prepararNutricionista() {
    const resultado = await conexion.query(`
        INSERT INTO nutricionistas (nombre)
        VALUES ($1)
        RETURNING id
    `, ['Prueba ' + identificador]);

    return resultado.rows[0].id;
}

// Eliminar solamente los datos de prueba
async function limpiarDatos(idNutricionista) {

    if (idNutricionista) {
        await conexion.query(`
            DELETE FROM reservas
            WHERE nutricionista_id = $1
            AND usuario_id IN (
                SELECT id FROM usuarios
                WHERE correo IN ($2, $3)
            )
        `, [
            idNutricionista,
            pacienteUno.correo,
            pacienteDos.correo
        ]);

        await conexion.query(`
            DELETE FROM nutricionistas
            WHERE id = $1
        `, [idNutricionista]);
    }

    await conexion.query(`
        DELETE FROM usuarios
        WHERE correo IN ($1, $2)
    `, [
        pacienteUno.correo,
        pacienteDos.correo
    ]);
}

// Ejecutar las pruebas del agendamiento
async function ejecutarPruebas() {

    let idNutricionista;

    try {

        const cuentaUno = await prepararCuenta(
            pacienteUno
        );

        const cuentaDos = await prepararCuenta(
            pacienteDos
        );

        idNutricionista =
            await prepararNutricionista();

        const reserva = {
            codigo_servicio: 'CN001',
            nutricionista_id: idNutricionista,
            fecha_reserva: obtenerFechaPrueba(),
            hora_reserva: '10:00'
        };

        // Prueba 1: Reserva sin token
        const sinToken = await agendar(reserva);

        comprobar.equal(sinToken.estado, 401);

        console.log('Reserva sin token: 401 - APROBADO');

        // Prueba 2: Manipular precio
        const precioInvalido = await agendar({
            ...reserva,
            precio: 1
        }, cuentaUno.token);

        comprobar.equal(precioInvalido.estado, 400);

        console.log('Manipulacion de precio: 400 - APROBADO');

        // Prueba 3: Manipular identidad
        const identidadInvalida = await agendar({
            ...reserva,
            usuario_id: cuentaDos.id
        }, cuentaUno.token);

        comprobar.equal(identidadInvalida.estado, 400);

        console.log('Manipulacion de identidad: 400 - APROBADO');

        // Prueba 4: Reserva correcta
        const creada = await agendar(
            reserva,
            cuentaUno.token
        );

        comprobar.equal(creada.estado, 201);

        const idReserva = creada.datos.reserva.id;

        console.log('Reserva creada: 201 - APROBADO');

        // Prueba 5: Comprobar datos almacenados
        const almacenada = await conexion.query(`
            SELECT r.usuario_id, r.precio,
                   s.precio AS precio_catalogo,
                   r.duracion_minutos
            FROM reservas r
            INNER JOIN servicios s
                ON r.codigo_servicio = s.codigo
            WHERE r.id = $1
        `, [idReserva]);

        comprobar.equal(
            almacenada.rows[0].usuario_id,
            cuentaUno.id
        );

        comprobar.equal(
            almacenada.rows[0].precio,
            almacenada.rows[0].precio_catalogo
        );

        comprobar.equal(
            almacenada.rows[0].duracion_minutos,
            50
        );

        console.log('Precio y datos del servidor: APROBADO');

        // Prueba 6: Horario duplicado
        const duplicada = await agendar(
            reserva,
            cuentaDos.token
        );

        comprobar.equal(duplicada.estado, 409);

        console.log('Horario duplicado: 409 - APROBADO');

        // Prueba 7: Horario superpuesto
        const superpuesta = await agendar({
            ...reserva,
            hora_reserva: '10:30'
        }, cuentaDos.token);

        comprobar.equal(superpuesta.estado, 409);

        console.log('Horario superpuesto: 409 - APROBADO');

        // Prueba 8: Horario disponible
        const disponible = await agendar({
            ...reserva,
            hora_reserva: '11:00'
        }, cuentaDos.token);

        comprobar.equal(disponible.estado, 201);

        console.log('Horario disponible: 201 - APROBADO');

        // Prueba 9: Solicitudes simultaneas
        const simultaneas = await Promise.all([
            agendar({
                ...reserva,
                hora_reserva: '12:00'
            }, cuentaUno.token),

            agendar({
                ...reserva,
                hora_reserva: '12:30'
            }, cuentaUno.token)
        ]);

        const estados = simultaneas
            .map(resultado => resultado.estado)
            .sort((a, b) => a - b);

        comprobar.deepEqual(estados, [201, 409]);

        console.log('Reservas simultaneas: APROBADO');

        // Prueba 10: Proteccion de reservas ajenas
        const historialUno = await enviarSolicitud(
            '/api/reservas?usuario_id=' + cuentaDos.id,
            'GET',
            null,
            cuentaUno.token
        );

        const historialDos = await enviarSolicitud(
            '/api/reservas',
            'GET',
            null,
            cuentaDos.token
        );

        comprobar.equal(historialUno.estado, 200);
        comprobar.equal(historialDos.estado, 200);

        comprobar.equal(historialUno.datos.length, 2);
        comprobar.equal(historialDos.datos.length, 1);

        comprobar.equal(
            historialUno.datos.some(
                cita => cita.id ===
                    disponible.datos.reserva.id
            ),
            false
        );

        comprobar.equal(
            historialDos.datos.some(
                cita => cita.id === idReserva
            ),
            false
        );

        console.log('Proteccion de reservas ajenas: APROBADO');

        console.log('------------------------------');
        console.log('Todas las pruebas aprobadas: 10 de 10');

    } catch (error) {
        console.error('Error en la prueba:', error.message);
        process.exitCode = 1;

    } finally {
        try {
            await limpiarDatos(idNutricionista);
        } finally {
            servidor.close();
            await conexion.end();
        }
    }
}
