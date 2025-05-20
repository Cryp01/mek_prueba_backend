## Estructura del Proyecto

```
│   .env                    # Variables de entorno para desarrollo
│   .env.example            # Ejemplo de variables de entorno
│   .gitignore              # Archivos y carpetas ignorados por git
│   docker-compose.yml      # Configuración de Docker Compose
│   Dockerfile              # Configuración para construir la imagen Docker
│   env.d.ts                # Tipado para variables de entorno
│   package-lock.json       # Versiones exactas de dependencias
│   package.json            # Dependencias y scripts
│   tsconfig.json           # Configuración de TypeScript
│
├───backend
│   └───node_modules        # Dependencias instaladas
├───init
│       init.sql            # Script SQL para inicialización
│
└───src
    │   index.ts            # Punto de entrada de la aplicación
    │
    ├───auth
    │       auth.ts         # Lógica de autenticación
    │
    ├───database
    │       connection.ts   # Configuración de conexión a base de datos
    │
    ├───models
    │       notes.ts        # Modelo de datos para notas
    │
    ├───routes
    │       notes.ts        # Rutas para el recurso de notas
    │       router.ts       # Configuración central de rutas
    │
    └───utils               # Utilidades comunes
```

## Descripción General

Este backend es una aplicación Node.js con Koa escrita en TypeScript que proporciona una API para gestionar notas. La aplicación está dockerizada para facilitar su despliegue y utiliza PostgreSQL como base de datos.

## Componentes Principales

### Configuración

- **Variables de Entorno**: La aplicación utiliza archivos `.env` para la configuración, gestionados con la biblioteca dotenv.
- **Docker**: La aplicación está containerizada con Docker y Docker Compose.
- **TypeScript**: El proyecto utiliza TypeScript para añadir tipado estático.

### Dependencias Principales

#### Framework y HTTP

- **Koa**: Framework web minimalista para Node.js
- **koa-router**: Enrutador para Koa
- **koa-bodyparser**: Middleware para análisis del cuerpo de las peticiones
- **@koa/cors**: Middleware para manejo de CORS (Cross-Origin Resource Sharing)

#### Base de Datos

- **pg** y **pg-hstore**: Controlador de PostgreSQL
- **sequelize**: ORM (Object-Relational Mapping) para bases de datos SQL

#### Autenticación y Seguridad

- **bcrypt**: Biblioteca para hash de contraseñas
- **jsonwebtoken**: Implementación de JSON Web Tokens

#### Búsqueda

- **typesense**: Cliente para el motor de búsqueda Typesense

#### Herramientas de Desarrollo

- **typescript**: Superset de JavaScript con tipado estático
- **nodemon**: Utilidad para reiniciar automáticamente el servidor durante el desarrollo
- **ts-node**: Ejecución de TypeScript sin compilación previa
- **jest**: Framework de pruebas

### Scripts de NPM

El proyecto incluye los siguientes scripts definidos en el package.json:

- **build**: `npx tsc` - Compila el código TypeScript a JavaScript
- **start**: `node dist/index.js` - Inicia la aplicación desde los archivos compilados
- **dev**: `nodemon src/index.ts --exec ts-node` - Inicia la aplicación en modo desarrollo con recarga automática

## Variables de Entorno

La aplicación utiliza las siguientes variables de entorno que deben configurarse en el archivo `.env`:

| Variable       | Descripción                                                                            |
| -------------- | -------------------------------------------------------------------------------------- |
| `db_port`      | Puerto de la base de datos PostgreSQL                                                  |
| `db_name`      | Nombre de la base de datos                                                             |
| `db_user`      | Usuario de la base de datos                                                            |
| `db_host`      | Host donde se encuentra la base de datos                                               |
| `db_password`  | Contraseña del usuario de la base de datos                                             |
| `JWT_SECRET`   | Clave secreta para la generación y verificación de tokens JWT                          |
| `DATABASE_URL` | URL completa de conexión a la base de datos (alternativa a las variables individuales) |

### Ejemplo de archivo .env

```
db_port=5432
db_name=my_database
db_user=postgres
db_host=postgres
db_password=my_secure_password
JWT_SECRET=your_jwt_secret_key
DATABASE_URL=postgresql://postgres:my_secure_password@localhost:5432/my_database
```

Nota: El archivo `.env.example` incluido en el proyecto contiene un ejemplo de estas variables sin valores sensibles. Es recomendable copiar este archivo a `.env` y rellenar los valores correspondientes.

## Instrucciones de Instalación y Ejecución

### Ejecución con Docker (Recomendado)

El proyecto está dockerizado, por lo que la forma más sencilla de ejecutarlo es utilizando Docker Compose:

```bash
# Iniciar la aplicación y servicios relacionados
docker-compose up

# Iniciar en modo detached (en segundo plano)
docker-compose up -d

# Detener los servicios
docker-compose down
```

### Ejecución Local (Desarrollo)

Para ejecutar el proyecto localmente sin Docker:

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Configurar las variables de entorno (copiar .env.example a .env y ajustar los valores)

3. Ejecutar en modo desarrollo:

   ```bash
   npm run dev
   ```

4. Para compilar y ejecutar en modo producción:
   ```bash
   npm run build
   npm start
   ```

## Modelos

### Modelo de Notas

El modelo `Note` representa notas creadas por los usuarios en el sistema. Está definido en `src/models/notes.ts`.

#### Estructura de la tabla

| Campo        | Tipo        | Descripción                                              |
| ------------ | ----------- | -------------------------------------------------------- |
| `id`         | INTEGER     | Identificador único, clave primaria autoincremental      |
| `title`      | STRING(255) | Título de la nota (obligatorio)                          |
| `content`    | TEXT        | Contenido de la nota                                     |
| `format`     | STRING(50)  | Formato del contenido (plain_text por defecto)           |
| `user_id`    | INTEGER     | ID del usuario propietario de la nota (obligatorio)      |
| `color`      | STRING(20)  | Color asignado a la nota                                 |
| `status`     | STRING(20)  | Estado de la nota (active por defecto)                   |
| `priority`   | INTEGER     | Prioridad de la nota (0 por defecto)                     |
| `created_at` | DATE        | Fecha de creación (generado automáticamente)             |
| `updated_at` | DATE        | Fecha de última actualización (generado automáticamente) |

#### Interfaces TypeScript

```typescript
// Atributos completos de una nota
interface NoteAttributes {
  id: number;
  title: string;
  content: string;
  format: string;
  userId: number;
  color: string;
  status: string;
  priority: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Atributos necesarios para crear una nota (algunos son opcionales)
interface NoteCreationAttributes
  extends Optional<
    NoteAttributes,
    "id" | "createdAt" | "updatedAt" | "color" | "status" | "priority"
  > {}
```

#### Servicio de Notas

El modelo incluye un servicio `NotesService` que proporciona los siguientes métodos:

1. **createNote**: Crea una nueva nota

   ```typescript
   async createNote(noteData: NoteCreationAttributes)
   ```

2. **getNotes**: Obtiene una lista paginada de notas con opciones de filtrado y ordenación

   ```typescript
   async getNotes(
     userId: number,
     options: {
       status?: string;
       searchTerm?: string;
       limit?: number;
       offset?: number;
       orderBy?: string;
       orderDir?: "ASC" | "DESC";
     } = {}
   )
   ```

3. **getNoteById**: Obtiene una nota específica por su ID

   ```typescript
   async getNoteById(noteId: number, userId: number)
   ```

4. **updateNote**: Actualiza una nota existente

   ```typescript
   async updateNote(
     noteId: number,
     userId: number,
     updateData: Partial<NoteAttributes>
   )
   ```

5. **deleteNote**: Elimina una nota (borrado lógico por defecto, borrado físico opcional)
   ```typescript
   async deleteNote(
     noteId: number,
     userId: number,
     permanent: boolean = false
   )
   ```

#### Características del Modelo

- Utiliza Sequelize como ORM
- Implementa soft delete (borrado lógico) mediante el campo `status`
- Soporta búsqueda en título y contenido
- Incluye opciones de paginación y ordenación
- Sigue el patrón de servicios para encapsular la lógica de negocio
