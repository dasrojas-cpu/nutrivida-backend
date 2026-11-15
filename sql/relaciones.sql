
ALTER TABLE reservas
ADD COLUMN IF NOT EXISTS usuario_id INTEGER
REFERENCES usuarios(id);

ALTER TABLE reservas
ADD COLUMN IF NOT EXISTS codigo_servicio VARCHAR(20)
REFERENCES servicios(codigo);

ALTER TABLE reservas
ADD COLUMN IF NOT EXISTS nutricionista_id INTEGER
REFERENCES nutricionistas(id);

ALTER TABLE reservas
ADD COLUMN IF NOT EXISTS precio INTEGER
CHECK (precio > 0);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reserva_horario
ON reservas (
    nutricionista_id,
    fecha_reserva,
    hora_reserva
)
WHERE nutricionista_id IS NOT NULL;

