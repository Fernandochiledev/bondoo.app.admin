# Instructivo de Integración API - Bondoo

Este documento detalla los endpoints, rutas, payloads y respuestas de la API de Bondoo para su integración con el Frontend.

**URL Base:** `https://4j9s67zbu6.execute-api.us-east-1.amazonaws.com/prod` (URL de producción)

---

## Autenticación

La mayoría de los endpoints requieren un token JWT para ser accedidos. El token debe enviarse en el header `Authorization`.

**Formato del Header:**
`Authorization: Bearer <TU_TOKEN_JWT>`

### Login
- **Ruta:** `/bondoo/auth`
- **Método:** `POST`
- **Descripción:** Autentica a un usuario y devuelve un token JWT. Las contraseñas se comparan usando hash SHA256.
- **Payload (Request Body):**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "tu_password"
}
```
- **Respuesta Exitosa (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "name": "Nombre del Usuario"
  }
}
```

### Cambio de Contraseña (Usuario)
- **Ruta:** `/bondoo/change-password`
- **Método:** `POST`
- **Autenticación:** Requerida (Bearer Token)
- **Descripción:** Cambia la contraseña del usuario autenticado. Requiere conocer la contraseña actual.
- **Payload (Request Body):**
```json
{
  "oldPassword": "tu_password_actual",
  "newPassword": "tu_nueva_password"
}
```

### Reset de Contraseña (Admin)
- **Ruta:** `/bondoo/admin/reset-password`
- **Método:** `POST`
- **Autenticación:** Requerida (Bearer Token)
- **Descripción:** Permite a un administrador resetear la contraseña de cualquier usuario sin conocer la actual.
- **Payload (Request Body):**
```json
{
  "targetUserId": "uuid-del-usuario-a-resetear",
  "newPassword": "nueva_password_generada"
}
```
- **Respuesta Exitosa (200 OK):**
```json
{
  "message": "Contraseña del usuario <id> reseteada correctamente"
}
```

---

## Endpoints Generales (CRUD)

Todos los siguientes endpoints siguen una estructura estándar de CRUD y requieren **Autenticación (Bearer Token)**.

**Nota de Seguridad:** En el recurso de **Usuarios**, el campo `password` nunca se devuelve en las respuestas (GET) ni se puede actualizar mediante el endpoint general de PATCH. Para cambiar la contraseña, utiliza `/bondoo/change-password`.

Todos los siguientes endpoints siguen una estructura estándar de CRUD y requieren **Autenticación (Bearer Token)**.

### Recursos Disponibles:
- **Usuarios:** `/bondoo/users` (PK: `userId`)
- **Países/Planes:** `/bondoo/countries` (PK: `countryId`)
- **Pagos/Suscripciones:** `/bondoo/suscriptions-pays` (PK: `payId`)
- **Sesiones:** `/bondoo/sessions` (PK: `sessionId`)
- **Objetos:** `/bondoo/object` (PK: `objectId`)
- **Packs:** `/bondoo/packs` (PK: `packId`)
- **Ajustes de Jugador:** `/bondoo/player-settings` (PK: `playerSettingId`)
- **Desafíos:** `/bondoo/challenges` (PK: `challengeId`)
- **Desafíos Completos (JOIN):** `/bondoo/challenges-complete` (Solo GET)

### Operaciones por Recurso:

#### 1. Listar todos los registros
- **Método:** `GET`
- **Ruta:** `/<recurso>`
- **Respuesta:** Array de objetos del recurso.

#### 2. Obtener un registro por ID
- **Método:** `GET`
- **Ruta:** `/<recurso>/:id`
- **Respuesta:** Objeto del recurso o `404 Not Found`.

#### 3. Crear un nuevo registro
- **Método:** `POST`
- **Ruta:** `/<recurso>`
- **Payload:** Objeto con los datos a crear. Si no se envía el ID (ej. `userId`), el sistema generará uno automáticamente (UUID).
- **Respuesta (211 Created):** Objeto creado incluyendo `createdAt` e `id`.

#### 4. Actualizar un registro (Parcial)
- **Método:** `PATCH`
- **Ruta:** `/<recurso>/:id`
- **Payload:** Objeto con los campos a actualizar.
- **Respuesta:** Objeto actualizado con los nuevos valores.

---

## Detalles de los Modelos de Datos (Referencia)

A continuación se describen los campos principales esperados para cada tabla basados en la configuración de base de datos:

### Usuarios (`/bondoo/users`)
- `userId` (String, PK)
- `email` (String)
- `password` (String)
- `name` (String)
- *Otros campos adicionales según sea necesario.*

### Países y Planes (`/bondoo/countries`)
- `countryId` (String, PK)
- `name` (String)
- `currency` (String)
- `plans` (Array/Object con detalles de planes)

### Pagos (`/bondoo/suscriptions-pays`)
- `payId` (String, PK)
- `userId` (String)
- `amount` (Number)
- `status` (String)
- `createdAt` (String, ISO Date)

### Sesiones (`/bondoo/sessions`)
- `sessionId` (String, PK)
- `userId` (String)
- `startTime` (String)
- `endTime` (String)

### Objetos (`/bondoo/object`)
- `objectId` (String, PK)
- `imagen` (String, URL de la imagen)
- `enObject` (String, Nombre/Descripción en Inglés)
- `esObject` (String, Nombre/Descripción en Español)
- `prObject` (String, Nombre/Descripción en Portugués)
- `frObject` (String, Nombre/Descripción en Francés)

### Packs (`/bondoo/packs`)
- `packId` (String, PK)
- `icon` (String, URL o nombre del icono)
- `order` (Number)
- `enName` (String, Nombre en Inglés)
- `esName` (String, Nombre en Español)
- `prName` (String, Nombre en Portugués)
- `frName` (String, Nombre en Francés)

### Ajustes de Jugador (`/bondoo/player-settings`)
- `playerSettingId` (String, PK)
- `icon` (String, URL o nombre del icono)
- `gender` (String)
- `order` (Number)
- `enName` (String, Nombre en Inglés)
- `esName` (String, Nombre en Español)
- `prName` (String, Nombre en Portugués)
- `frName` (String, Nombre en Francés)

### Desafíos (`/bondoo/challenges`)
- `challengeId` (String, PK)
- `levelId` (String, ID del nivel asociado)
- `objectId` (String, ID del objeto asociado)
- `isQuestion` (Boolean, Indica si es una pregunta)
- `duration` (Number, Duración en segundos)
- `enText` (String, Texto en Inglés)
- `esText` (String, Texto en Español)
- `prText` (String, Texto en Portugués)
- `frText` (String, Texto en Francés)

### Desafíos Completos (`/bondoo/challenges-complete`)
- **Método:** `GET`
- **Descripción:** Devuelve todos los desafíos, pero cada uno incluye el objeto completo de su `level` y su `object` (en lugar de solo los IDs).
- **Respuesta:** Array de objetos con la estructura:
```json
{
  "challengeId": "...",
  "levelId": "...",
  "objectId": "...",
  "level": { "nivelId": "...", "name": "...", "description": "..." },
  "object": { "objectId": "...", "imagen": "...", "esObject": "...", ... },
  ...
}
```

---

## Notas Adicionales
- Todos los endpoints devuelven errores en formato JSON: `{"error": "Mensaje de error"}`.
- Los errores comunes incluyen `401` (Token requerido), `403` (Token inválido), `404` (No encontrado) y `500` (Error interno del servidor).
