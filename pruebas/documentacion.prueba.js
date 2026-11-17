const validador = require('@apidevtools/swagger-parser');
const comprobar = require('node:assert/strict');

async function comprobarDocumentacion() {

    const documento = await validador.validate(
        'src/documentacion/openapi.json'
    );

    console.log('Estructura OpenAPI: APROBADO');

    const metodos = ['get', 'post', 'put', 'delete'];

    let operaciones = 0;

    for (const [ruta, contenido] of
        Object.entries(documento.paths)) {

        for (const metodo of Object.keys(contenido)) {

            if (metodos.includes(metodo)) {
                console.log(metodo.toUpperCase(), ruta);
                operaciones++;
            }
        }
    }

    // Comprobar la cantidad de operaciones documentadas
    comprobar.equal(operaciones, 11);

    // Comprobar la documentacion de nutricionistas
    const nutricionistas =
        documento.paths['/api/nutricionistas']?.get;

    comprobar.ok(nutricionistas);
    comprobar.ok(nutricionistas.responses['200']);
    comprobar.ok(nutricionistas.responses['500']);
    comprobar.deepEqual(nutricionistas.security, []);

    console.log('Endpoint nutricionistas: APROBADO');
    console.log('------------------------------');
    console.log('Total de endpoints:', operaciones);
    console.log('Documentacion de API: APROBADO');
}

comprobarDocumentacion().catch(error => {
    console.error('Error:', error.message);
    process.exitCode = 1;
});
