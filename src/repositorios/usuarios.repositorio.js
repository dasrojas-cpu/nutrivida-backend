const conexion = require('../configuracion/baseDatos');

// Crear una cuenta de paciente
async function crearUsuario(usuario) {
    const resultado = await conexion.query(`
        INSERT INTO usuarios (
            nombre,
            apellido,
            correo,
            password_hash,
            rol_id
        )
        VALUES (
            $1, $2, $3, $4,
            (SELECT id FROM roles WHERE nombre = 'paciente')
        )
        ON CONFLICT (correo) DO NOTHING
        RETURNING id, nombre, apellido, correo, activo
    `, [
        usuario.nombre,
        usuario.apellido,
        usuario.correo,
        usuario.hash
    ]);

    return resultado.rows[0] || null;
}

// Buscar un usuario por correo
async function buscarPorCorreo(correo) {
    const resultado = await conexion.query(`
        SELECT u.id, u.nombre, u.apellido,
               u.correo, u.password_hash AS hash,
               u.activo, r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE u.correo = $1
    `, [correo]);

    return resultado.rows[0] || null;
}

// Buscar el perfil de un usuario
async function buscarPorId(id) {
    const resultado = await conexion.query(`
        SELECT u.id, u.nombre, u.apellido,
               u.correo, u.activo,
               r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE u.id = $1
    `, [id]);

    return resultado.rows[0] || null;
}

module.exports = {
    crearUsuario,
    buscarPorCorreo,
    buscarPorId
};
