const validador = require('@apidevtools/swagger-parser');
const comprobar = require('node:assert/strict');

async function comprobarDocumentacion() {

    const documento = await validador.validate(
        'src/documentacion/openapi.json'
    );

    console.log('Estructura OpenAPI: APROBADO');

    const metodos = [
        'get', 'post', 'put', 'delete'
    ];

    let operaciones = 0;

    for (const [ruta, contenido] of
        Object.entries(documento.paths)) {

        for (const metodo of Object.keys(contenido)) {

            if (metodos.includes(metodo)) {
                console.log(
                    metodo.toUpperCase(), ruta
                );

                operaciones++;
            }
        }
    }

    comprobar.equal(operaciones, 10);

    console.log('------------------------------');
    console.log('Total de endpoints:', operaciones);
    console.log('Documentacion de API: APROBADO');
}

comprobarDocumentacion().catch(error => {
    console.error('Error:', error.message);
    process.exitCode = 1;
});
