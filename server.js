require('dotenv').config({ quiet: true });

const aplicacion = require('./src/aplicacion');

const puerto = Number(process.env.PORT || 3000);
const servidor = process.env.HOST || '127.0.0.1';

// Iniciar el servidor
aplicacion.listen(puerto, servidor, () => {
    console.log('Servidor Nutrivida iniciado');
    console.log('Puerto:', puerto);
});
