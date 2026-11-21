# NutriVida - Backend

## 1. Identificacion del proyecto

- Asignatura: Desarrollo Fullstack II - DSY1104.
- Proyecto: NutriVida.
- Entrega: Guia 19.
- Seccion: pendiente de completar.
- Integrantes: pendiente de completar.

NutriVida es una aplicacion web que permite consultar servicios
nutricionales, registrar usuarios, iniciar sesion, reservar
horas de atencion y consultar el historial de reservas.

Los administradores pueden crear, editar y desactivar servicios.

## 2. Repositorios del proyecto

- Backend:
  https://github.com/dasrojas-cpu/nutrivida-backend

- Frontend:
  https://github.com/joaberrios/nutrivida-frontend

El frontend y el backend se mantienen separados para facilitar
el desarrollo, las pruebas y el mantenimiento de cada proyecto.

## 3. Tecnologias utilizadas

| Tecnologia | Version o funcion |
|---|---|
| Node.js | 22.22.1 |
| npm | 9.2.0 |
| Express | 5.3.0 declarada en package.json |
| PostgreSQL | 18.3 |
| AWS EC2 | Servidor del backend |
| AWS RDS | Base de datos PostgreSQL |
| React | Interfaz del usuario |
| Swagger | Documentacion de API REST |
| Argon2id | Hash de contrasenas |
| JWT | Autenticacion mediante tokens |

Elegimos Node.js y Express porque permiten implementar una API
REST organizada y utilizar JavaScript en ambos proyectos.

Utilizamos EC2 en lugar de Lambda como servidor principal porque
permite mantener Express funcionando como un proceso continuo,
facilitando las pruebas, las rutas y Swagger.

PostgreSQL permite relacionar usuarios, servicios y reservas,
ademas de aplicar restricciones, transacciones y claves foraneas.

## 4. Arquitectura por capas

| Carpeta | Responsabilidad |
|---|---|
| configuracion | Conexion a PostgreSQL y transacciones |
| rutas | Definir los endpoints |
| controladores | Recibir solicitudes y entregar respuestas HTTP |
| servicios | Aplicar reglas de negocio |
| repositorios | Ejecutar consultas SQL parametrizadas |
| modelos | Representar los datos |
| validaciones | Comprobar los datos recibidos |
| seguridad | Autenticacion, contrasenas, roles y permisos |
| documentacion | Configurar Swagger y OpenAPI |
| pruebas | Verificar el comportamiento del backend |
| sql | Crear tablas, relaciones y datos iniciales |

Flujo de una solicitud:

React -> Ruta -> Seguridad y validacion -> Controlador
-> Servicio -> Repositorio -> PostgreSQL.

La separacion permite modificar una responsabilidad sin tener
que mezclar toda la logica dentro de un mismo archivo.

El frontend utiliza Atomic Design y hooks personalizados
para separar la interfaz de la logica.

## 5. Base de datos

La base de datos contiene seis tablas:

- roles
- usuarios
- categorias
- servicios
- nutricionistas
- reservas

Los usuarios pertenecen a un rol y los servicios pertenecen
a una categoria.

Las reservas relacionan usuarios, servicios y nutricionistas.

Las claves foraneas de reservas permiten valores nulos para
conservar registros antiguos. Las nuevas reservas deben tener
las asociaciones correspondientes, validadas por el backend.

Los precios y las duraciones deben ser positivos.

El indice idx_reserva_horario evita repetir el mismo horario
para un nutricionista. El servicio de reservas utiliza
transacciones y bloqueos para controlar horarios superpuestos
y solicitudes simultaneas.

Los servicios se desactivan mediante eliminacion logica para
no perder el historial de reservas.

### Diagramas

- Diagrama entidad-relacion: [archivo editable](docs/guia19/diagramas/01_Modelo_ER.drawio).
- Diagrama de arquitectura: [archivo editable](docs/guia19/diagramas/02_Arquitectura.drawio).
- Diagrama de secuencia JWT: [archivo editable](docs/guia19/diagramas/03_Secuencia_JWT.drawio).

Los archivos deben quedar disponibles para lectura del profesor.

## 6. Instalacion

### Requisitos

- Node.js 22 y npm.
- PostgreSQL disponible, con una base de datos creada.
- Acceso autorizado a la base de datos.
- Certificado de RDS cuando corresponda.

Clonar el repositorio:

```bash
git clone https://github.com/dasrojas-cpu/nutrivida-backend.git
cd nutrivida-backend
npm ci
```

Crear la configuracion local en una instalacion nueva:

```bash
cp -n .env.example .env
chmod 600 .env
nano .env
```

Completar las variables:

- HOST: direccion donde escucha Express.
- PORT: puerto del servidor.
- DB_HOST: direccion de PostgreSQL.
- DB_PORT: puerto de PostgreSQL.
- DB_NAME: nombre de la base de datos.
- DB_USER: usuario autorizado.
- DB_PASSWORD: contrasena de PostgreSQL.
- JWT_SECRETO: clave hexadecimal secreta.

Para generar una clave JWT nueva:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Guardar la clave en .env sin publicarla ni incluirla en capturas.

### Certificado de AWS RDS

La conexion utiliza validacion del certificado TLS.

Para una instancia RDS convencional se requiere el certificado
global-bundle.pem dentro de ~/certificados.

Descargarlo desde la documentacion oficial de AWS.

No desactivar la validacion del certificado para solucionar
problemas de conexion.

### Crear las tablas y datos iniciales

Ejecutar los siguientes archivos en orden sobre una base
de datos nueva y autorizada:

1. sql/schema.sql
2. sql/relaciones.sql
3. sql/duracion_reservas.sql
4. sql/datos_iniciales.sql

Si se utiliza psql con RDS, configurar la conexion con
sslmode=verify-full y el certificado correspondiente.

Ejemplo con valores que deben reemplazarse:

```bash
psql -W "host=ENDPOINT_RDS port=5432 dbname=nutrivida user=USUARIO sslmode=verify-full sslrootcert=$HOME/certificados/global-bundle.pem" \
    -v ON_ERROR_STOP=1 \
    --single-transaction \
    -f sql/schema.sql \
    -f sql/relaciones.sql \
    -f sql/duracion_reservas.sql \
    -f sql/datos_iniciales.sql
```

La instalacion inicial crea seis tablas, dos roles,
dos categorias, diez servicios y cuatro nutricionistas.

No se incluyen cuentas de pacientes ni contrasenas reales.

### Iniciar el servidor

```bash
npm start
```

Direccion local:

http://127.0.0.1:3000

En EC2 podemos mantener el proceso funcionando con:

```bash
nohup env HOST=127.0.0.1 PORT=3000 node server.js > ~/nutrivida-servidor.log 2>&1 < /dev/null &
```

Este mecanismo sirve para el laboratorio. Para produccion
queda pendiente configurar un gestor de procesos que permita
el reinicio automatico del servicio.

## 7. Documentacion de la API

Swagger UI:

http://127.0.0.1:3000/documentacion/

Documento OpenAPI:

http://127.0.0.1:3000/openapi.json

Estas direcciones corresponden al equipo donde se ejecuta
el servidor.

Desde Windows utilizamos un tunel SSH hacia EC2, redirigiendo
el puerto local 3001 al puerto 3000 del servidor.

En ese caso Swagger se consulta desde:

http://127.0.0.1:3001/documentacion/

### Endpoints implementados

| Metodo | Ruta | Permiso | Pantalla |
|---|---|---|---|
| POST | /api/auth/register | Publico | Registro |
| POST | /api/auth/login | Publico | Login |
| GET | /api/auth/me | Autenticado | Perfil de sesion |
| GET | /api/servicios | Publico | Catalogo |
| GET | /api/servicios/{codigo} | Publico | Detalle |
| POST | /api/servicios | Administrador | Administracion |
| PUT | /api/servicios/{codigo} | Administrador | Administracion |
| DELETE | /api/servicios/{codigo} | Administrador | Administracion |
| GET | /api/nutricionistas | Publico | Agendamiento |
| POST | /api/reservas | Paciente | Confirmar cita |
| GET | /api/reservas | Autenticado, datos propios | Mis citas |

El endpoint de perfil permite consultar la identidad del
usuario autenticado. La sesion inicial de React se obtiene
desde la respuesta de login.

El historial esta disponible para pacientes en la interfaz.
El backend permite consultar exclusivamente las reservas
propias de un usuario autenticado.

La documentacion OpenAPI contiene los parametros, cuerpos,
respuestas y requisitos de autenticacion de los endpoints.

### Ejemplo de reserva

POST /api/reservas

Authorization: Bearer TOKEN_DE_EJEMPLO

```json
{
  "codigo_servicio": "CN001",
  "nutricionista_id": 1,
  "fecha_reserva": "2026-12-07",
  "hora_reserva": "10:30"
}
```

La fecha es un ejemplo y debe ajustarse a un horario futuro
disponible al ejecutar la solicitud.

El backend obtiene el usuario desde el JWT, busca el precio
y la duracion del servicio en sus datos y verifica el horario
antes de almacenar la reserva.

El cliente no puede definir el precio ni la identidad
del paciente.

### Respuestas HTTP

- 200: consulta o actualizacion correcta.
- 201: registro o recurso creado.
- 204: eliminacion sin contenido.
- 400: datos invalidos.
- 401: autenticacion ausente o invalida.
- 403: permisos insuficientes.
- 404: recurso no encontrado.
- 409: conflicto o registro duplicado.
- 429: demasiados intentos.
- 500: error interno.

La cancelacion y modificacion de reservas no forman parte
de los endpoints implementados en esta etapa.
Se debe revisar su alcance con los requisitos del proyecto.

## 8. Seguridad

### Proteccion de contrasenas

Utilizamos Argon2id porque dificulta los ataques de fuerza
bruta al requerir tiempo de procesamiento y memoria.

Configuracion implementada:

- Memoria: 19456 KiB (19 MiB).
- Iteraciones: 2.
- Paralelismo: 1.

La configuracion sigue una de las recomendaciones minimas
de OWASP.

Las contrasenas se almacenan como hashes con salt individual,
no como texto plano ni como datos cifrados de forma reversible.

El registro exige contrasenas de entre 15 y 128 caracteres.
El inicio de sesion utiliza mensajes genericos para evitar
revelar si un correo esta registrado.

### Autenticacion JWT

- Algoritmo: HS256.
- Vigencia: 1800 segundos (30 minutos).
- sub: identificador del usuario.
- iss: nutrivida-backend.
- aud: nutrivida-frontend.
- exp: vencimiento del token.

El secreto se mantiene fuera del repositorio mediante .env.

El backend verifica la firma, el algoritmo, el emisor,
el destinatario y la vigencia del token.

Tambien consulta el estado activo y el rol del usuario
en la base de datos.

React mantiene el token en memoria y lo elimina al cerrar
la sesion o al vencer su tiempo de acceso.

No se implementaron refresh tokens ni una lista de revocacion.
Cerrar sesion elimina el token del navegador, pero no invalida
inmediatamente una copia previa del token en el servidor.
Una cuenta deshabilitada pierde acceso a las rutas protegidas.

### Autorizacion

El registro publico solamente permite crear pacientes.

El rol de administrador debe asignarse mediante un
procedimiento autorizado.

Las operaciones administrativas verifican el rol en el
servidor. Ocultar botones en React no reemplaza este control.

El historial utiliza la identidad obtenida del JWT para evitar
que un paciente pueda consultar las reservas de otro.

### Otros controles implementados

- Consultas SQL parametrizadas.
- CORS limitado a los origenes locales autorizados.
- Limite de cinco intentos de login cada quince minutos por IP.
- Limite de diez solicitudes de registro cada quince minutos por IP.
- Validacion de datos en el servidor.
- Respuestas genericas para errores internos.
- Archivo .env ignorado por Git y con permisos 600.
- Puerto 3000 restringido a localhost.
- Validacion TLS de la conexion a PostgreSQL.

### Controles pendientes de produccion

- HTTPS mediante certificado y proxy inverso.
- Administracion segura y rotacion de secretos.
- Politica de revocacion de sesiones, si se requiere.
- Monitoreo y registros de seguridad.
- Reinicio automatico del servidor.

Actualmente se utiliza un tunel SSH cifrado para las pruebas
del laboratorio. Este tunel no equivale a una API HTTPS.

## 9. Pruebas realizadas

### Pruebas unitarias

```bash
npm test
```

| Area | Resultado |
|---|---|
| JWT | 5 de 5 |
| Permisos | 4 de 4 |
| Duracion | 7 de 7 |
| Horarios | 10 de 10 |
| OpenAPI | Validacion aprobada |

Total: 26 casos aprobados y 11 endpoints documentados.

### Pruebas de integracion

```bash
npm run test:integracion
```

| Area | Resultado |
|---|---|
| Registro | 6 de 6 |
| Autenticacion | 6 de 6 |
| Perfil | 7 de 7 |
| Administracion | 7 de 7 |
| Edicion y eliminacion | 9 de 9 |
| Reservas | 10 de 10 |

Total: 45 casos aprobados.

Las pruebas utilizan solicitudes HTTP reales, usuarios
ficticios y un esquema temporal de PostgreSQL.

El ejecutor prepara sus propias tablas y datos iniciales,
verifica el aislamiento y elimina su esquema al terminar.

El usuario de PostgreSQL necesita permiso para crear esquemas.
Se recomienda utilizar una base de datos exclusiva de pruebas
fuera del entorno academico.

### Resumen de resultados

Resultados informados al 19 de noviembre de 2026:

- Backend: 71 casos aprobados.
- Frontend: 107 de 107 casos aprobados el 20 de noviembre de 2026.
- Total frontend y backend: 178 casos aprobados.
- Cobertura de lineas: 75.38%.
- Cobertura de sentencias: 74.81%.
- Cobertura de funciones: 68.84%.
- Cobertura de ramificaciones: 67.72%.
- Oxlint: 0 errores y 0 advertencias.
- Compilacion del frontend: aprobada.
- Instalacion PostgreSQL desde cero: aprobada.
- Swagger y OpenAPI: aprobados.
- Auditorias de dependencias de produccion: sin
  vulnerabilidades detectadas en esa ejecucion.

La cobertura y el analisis estatico del frontend fueron verificados.

La ausencia de vulnerabilidades en npm audit no garantiza
que la aplicacion este libre de problemas de seguridad.

## 10. Planificacion de las proximas dos semanas

Propuesta de trabajo pendiente de confirmar con el equipo:

| Semana | Actividad | Resultado esperado |
|---|---|---|
| 1 | Validacion final del frontend | Pruebas y compilacion |
| 1 | Diagramas y documentacion | Archivos editables y enlaces |
| 1 | Revision de seguridad | Controles documentados |
| 1 | Pruebas manuales completas | Evidencias de funcionamiento |
| 2 | Configuracion HTTPS | Despliegue seguro |
| 2 | Revision de infraestructura | Mejorar disponibilidad |
| 2 | Revision de ambos repositorios | Version consistente |
| 2 | Preparacion de entrega | Demostracion y checklist |

### Responsabilidades del equipo

- Frontend: componentes, pantallas, hooks y pruebas.
- Backend: API, seguridad, reglas de negocio y pruebas.
- Base de datos: tablas, relaciones, scripts y respaldo.
- Documentacion: diagramas, evidencias y revision final.

La asignacion individual de responsabilidades debe
completarse con los nombres reales del equipo.

## 11. Referencias

- OWASP. Password Storage Cheat Sheet.
  https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

- IETF. RFC 8725: JSON Web Token Best Current Practices.
  https://www.rfc-editor.org/rfc/rfc8725.html

- AWS. Using SSL with a PostgreSQL DB instance.
  https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.SSL.html

