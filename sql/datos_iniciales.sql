
-- Cargar los servicios originales de Nutrivida

INSERT INTO servicios (
    codigo,
    categoria_id,
    nombre,
    duracion,
    modalidad,
    profesional,
    precio,
    descripcion
)
VALUES
(
    'CN001',
    (SELECT id FROM categorias WHERE nombre = 'Consulta'),
    'Primera consulta nutricional',
    '50 min',
    'Presencial',
    'Nutricionista',
    35000,
    'Evaluación inicial: anamnesis, antropometría completa y diseño del primer plan alimenticio.'
),
(
    'CN002',
    (SELECT id FROM categorias WHERE nombre = 'Consulta'),
    'Control nutricional (seguimiento)',
    '30 min',
    'Presencial',
    'Nutricionista',
    25000,
    'Seguimiento mensual: medición de indicadores y ajuste del plan vigente.'
),
(
    'CN003',
    (SELECT id FROM categorias WHERE nombre = 'Consulta'),
    'Control nutricional quincenal',
    '30 min',
    'Presencial',
    'Nutricionista',
    22000,
    'Seguimiento intensivo cada 15 días. Recomendado en los primeros 2 meses.'
),
(
    'CN004',
    (SELECT id FROM categorias WHERE nombre = 'Consulta'),
    'Teleconsulta nutricional',
    '30 min',
    'Online (video)',
    'Nutricionista',
    20000,
    'Consulta de seguimiento vía videollamada. Requiere contar con consulta presencial previa.'
),
(
    'CN005',
    (SELECT id FROM categorias WHERE nombre = 'Consulta'),
    'Consulta de urgencia / reagendada',
    '30 min',
    'Presencial',
    'Nutricionista',
    28000,
    'Para pacientes que requieren atención fuera de su control habitual.'
),
(
    'PL001',
    (SELECT id FROM categorias WHERE nombre = 'Plan especializado'),
    'Plan pérdida de peso (1 mes)',
    '—',
    'Presencial',
    'Nutricionista',
    65000,
    'Incluye primera consulta + 1 control quincenal + plan alimenticio personalizado + seguimiento por WhatsApp.'
),
(
    'PL002',
    (SELECT id FROM categorias WHERE nombre = 'Plan especializado'),
    'Plan pérdida de peso (3 meses)',
    '—',
    'Presencial',
    'Nutricionista',
    170000,
    'Incluye primera consulta + 5 controles + 3 planes mensuales + seguimiento continuo.'
),
(
    'PL003',
    (SELECT id FROM categorias WHERE nombre = 'Plan especializado'),
    'Plan nutrición deportiva (1 mes)',
    '—',
    'Presencial',
    'Nutricionista',
    70000,
    'Para deportistas y personas con actividad física frecuente. Cálculo de requerimientos energéticos y proteicos.'
),
(
    'PL004',
    (SELECT id FROM categorias WHERE nombre = 'Plan especializado'),
    'Plan control diabetes / hipertensión',
    '—',
    'Presencial',
    'Nutricionista',
    75000,
    'Plan adaptado para patologías metabólicas. Coordinación con médico tratante si aplica.'
),
(
    'PL005',
    (SELECT id FROM categorias WHERE nombre = 'Plan especializado'),
    'Plan alimentación vegetariana/vegana',
    '—',
    'Presencial',
    'Nutricionista',
    68000,
    'Diseñado para garantizar aporte adecuado de proteínas, hierro, vitamina B12 y calcio sin productos animales.'
)
ON CONFLICT (codigo) DO NOTHING;

