const archivos = require('node:fs');
const { randomUUID, randomBytes } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const conexion = require('../src/configuracion/baseDatos');

const esquema = 'pruebas_' + randomUUID().replace(/-/g, '');

const scripts = [
    'schema.sql',
    'relaciones.sql',
    'duracion_reservas.sql',
    'datos_iniciales.sql'
];

const pruebas = [
    'registro',
    'autenticacion',
    'perfil',
    'administracion',
    'edicionServicios',
    'reservas'
];

// Preparar un esquema independiente de los datos reales.
async function prepararEsquema() {
    const cliente = await conexion.connect();

    try {
        await cliente.query('BEGIN');
        await cliente.query(`CREATE SCHEMA ${esquema}`);
        await cliente.query(`SET LOCAL search_path TO ${esquema}`);

        for (const archivo of scripts) {
            const contenido = archivos.readFileSync(
                'sql/' + archivo,
                'utf8'
            );

            await cliente.query(contenido);
        }

        await cliente.query('COMMIT');

    } catch (error) {
        await cliente.query('ROLLBACK');
        throw error;

    } finally {
        cliente.release();
    }
}

// Ejecutar cada prueba en un proceso independiente.
function ejecutarArchivo(archivo, entorno, argumentos = []) {
    const resultado = spawnSync(
        process.execPath,
        [archivo, ...argumentos],
        {
            env: entorno,
            stdio: 'inherit',
            timeout: 120000
        }
    );

    if (resultado.error || resultado.status !== 0) {
        throw new Error('Fallo en la ejecucion: ' + archivo);
    }
}

async function ejecutarIntegracion() {
    let esquemaCreado = false;

    try {
        await prepararEsquema();
        esquemaCreado = true;

        console.log('Esquema temporal preparado:', esquema);

        const entorno = {
            ...process.env,
            PGOPTIONS: '-c search_path=' + esquema,
            JWT_SECRETO: randomBytes(32).toString('hex')
        };

        // Verificar el aislamiento antes de ejecutar pruebas.
        ejecutarArchivo('-e', entorno, [
            `
            const bd = require('./src/configuracion/baseDatos');
            bd.query('SELECT current_schema() AS esquema')
                .then(resultado => {
                    require('node:assert/strict').equal(
                        resultado.rows[0].esquema,
                        '${esquema}'
                    );
                    console.log('Aislamiento: APROBADO');
                })
                .catch(error => {
                    console.error(error.message);
                    process.exitCode = 1;
                })
                .finally(() => bd.end());
            `
        ]);

        for (const prueba of pruebas) {
            console.log('\n=== ' + prueba.toUpperCase() + ' ===');

            ejecutarArchivo(
                'pruebas/' + prueba + '.prueba.js',
                entorno
            );
        }

        console.log('\nINTEGRACION COMPLETA: APROBADA');

    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;

    } finally {
        try {
            // Eliminar exclusivamente el esquema temporal creado.
            if (esquemaCreado && /^pruebas_[a-f0-9]{32}$/.test(esquema)) {
                await conexion.query(
                    `DROP SCHEMA ${esquema} CASCADE`
                );

                console.log('Esquema temporal eliminado.');
            }
        } catch (error) {
            console.error('Error de limpieza:', error.message);
            process.exitCode = 1;
        } finally {
            await conexion.end();
        }
    }
}

ejecutarIntegracion();
