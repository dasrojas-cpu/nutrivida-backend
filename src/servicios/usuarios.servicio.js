const repositorio = require(
    '../repositorios/usuarios.repositorio'
);

const seguridad = require(
    '../seguridad/contrasenas'
);

const modelo = require(
    '../modelos/usuarios.modelo'
);

// Registrar un nuevo paciente
async function registrarUsuario(datos) {
    const hash = await seguridad.protegerContrasena(
        datos.contrasena
    );

    const usuario = {
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        correo: datos.correo.trim().toLowerCase(),
        hash: hash
    };

    const resultado = await repositorio.crearUsuario(
        usuario
    );

    if (!resultado) {
        return null;
    }

    return modelo.representarUsuario(
        resultado,
        'paciente'
    );
}

module.exports = {
    registrarUsuario
};
