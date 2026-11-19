
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES roles(id),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    CHECK (correo = LOWER(TRIM(correo)))
);

CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS servicios (
    codigo VARCHAR(20) PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    nombre VARCHAR(150) NOT NULL,
    duracion VARCHAR(50) NOT NULL,
    modalidad VARCHAR(50) NOT NULL,
    profesional VARCHAR(100) NOT NULL,
    precio INTEGER NOT NULL CHECK (precio > 0),
    descripcion TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS nutricionistas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO roles (nombre)
VALUES ('paciente'), ('administrador')
ON CONFLICT DO NOTHING;

INSERT INTO categorias (nombre)
VALUES ('Consulta'), ('Plan especializado')
ON CONFLICT DO NOTHING;

INSERT INTO nutricionistas (nombre)
VALUES
    ('Nutricionista 1'),
    ('Nutricionista 2'),
    ('Nutricionista 3'),
    ('Nutricionista 4')
ON CONFLICT DO NOTHING;


-- Crear la tabla principal de reservas nutricionales.
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    nombre_paciente VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    estado VARCHAR(30) DEFAULT 'Pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
