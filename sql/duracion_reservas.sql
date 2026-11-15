
ALTER TABLE reservas
ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER
CHECK (duracion_minutos > 0);

