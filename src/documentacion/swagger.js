const swagger = require('swagger-ui-express');
const documento = require('./openapi.json');

// Configurar la documentacion de la API
function configurarDocumentacion(aplicacion) {

    aplicacion.get('/openapi.json',
        (solicitud, respuesta) => {
            respuesta.json(documento);
        }
    );

    aplicacion.use(
        '/documentacion',
        swagger.serve,
        swagger.setup(documento, {
            customSiteTitle: 'API Nutrivida',
            swaggerOptions: {
                persistAuthorization: false,
                validatorUrl: null
            }
        })
    );
}

module.exports = {
    configurarDocumentacion
};
