Aquí tienes una documentación en formato Markdown (`.md`) que explica cómo integrar Auth0 en tu API de NestJS:

```markdown
# Integración de Auth0 en una API de NestJS

Esta documentación explica cómo integrar Auth0 para manejar la autenticación y autorización en una API construida con NestJS.

## Requisitos Previos

- Una cuenta de Auth0.
- Una aplicación API configurada en Auth0.
- Una aplicación cliente configurada en Auth0 para obtener tokens de acceso.
- Un proyecto de NestJS configurado.

## Configuración de Auth0

1. **Crear una API en Auth0:**
   - Ve al dashboard de Auth0.
   - Navega a "Applications" > "APIs" y crea una nueva API.
   - Define un identificador único para tu API (por ejemplo, `prueba_123`).

2. **Configurar una Aplicación Cliente:**
   - En el dashboard de Auth0, ve a "Applications" > "Applications" y crea una nueva aplicación.
   - Configura la aplicación para usar el flujo de "Client Credentials" para obtener tokens de acceso.
   - Anota el `client_id` y `client_secret` de la aplicación.

## Obtención de Tokens de Acceso

Para obtener un token de acceso desde tu aplicación cliente, puedes hacer una solicitud a Auth0 utilizando el siguiente código:

```javascript
var request = require("request");

var options = {
  method: 'POST',
  url: 'https://dev-xv0d8443yz5fq5k2.us.auth0.com/oauth/token',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    client_id: "aAAflzLy4sHlRy3NTXCAT2MGvIqZbe9f",
    client_secret: "hVT4em8x5yuOWEewaTr4LBqXChgNXPfu89faRfQnFL_1UPkfYjSZAXwYqrZHdqwo",
    audience: "prueba_123",
    grant_type: "client_credentials"
  })
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

La respuesta incluirá un `access_token` que puedes usar para autenticar las solicitudes a tu API.

## Configuración de NestJS para Validar Tokens

1. **Instalar Dependencias:**

   Instala las dependencias necesarias para validar tokens JWT en tu API de NestJS:

   ```bash
   npm install express-oauth2-jwt-bearer
   ```

2. **Crear un Guard de Autorización:**

   Crea un guard (`AuthorizationGuard`) para validar los tokens de acceso en las solicitudes entrantes:

   ```typescript
   import {
     Injectable,
     CanActivate,
     ExecutionContext,
     UnauthorizedException,
     InternalServerErrorException,
   } from '@nestjs/common';
   import {
     auth,
     InvalidTokenError,
     UnauthorizedError,
   } from 'express-oauth2-jwt-bearer';
   import { Request, Response } from 'express';
   import { promisify } from 'util';
   import { envs } from 'src/config';

   @Injectable()
   export class AuthorizationGuard implements CanActivate {
     async canActivate(context: ExecutionContext): Promise<boolean> {
       const request = context.switchToHttp().getRequest<Request>();
       const response = context.switchToHttp().getResponse<Response>();

       const validateAccessToken = promisify(auth({
         audience: envs.AUDIENCE,
         issuer: envs.AUTH0_ISSUER_BASE_URL,
         tokenSigningAlg: envs.TOKEN_ALG,
       }));

       try {
         await validateAccessToken(request, response);
         return true;
       } catch (error) {
         if (error instanceof InvalidTokenError) {
           throw new UnauthorizedException('Bad credentials');
         }
         if (error instanceof UnauthorizedError) {
           throw new UnauthorizedException('Authentication required');
         }
         throw new InternalServerErrorException();
       }
     }
   }
   ```

3. **Crear un Guard de Permisos:**

   Crea un guard (`PermissionsGuard`) para verificar los permisos del usuario:

   ```typescript
   import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
   import { Reflector } from '@nestjs/core';

   @Injectable()
   export class PermissionsGuard implements CanActivate {
     constructor(private reflector: Reflector) {}

     canActivate(context: ExecutionContext): boolean {
       const [req] = context.getArgs();
       const userPermissions = req?.auth?.payload?.permissions || [];

       const requiredPermissions = this.reflector.get('permissions', context.getHandler()) || [];
       const hasAllRequiredPermissions = requiredPermissions.every(permission => userPermissions.includes(permission));

       if (requiredPermissions.length === 0 || hasAllRequiredPermissions) {
         return true;
       }

       throw new ForbiddenException("Insufficient permissions");
     }
   }
   ```

## Uso de los Guards en los Controladores

Aplica los guards en tus controladores para proteger las rutas:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthorizationGuard } from './authorization.guard';
import { PermissionsGuard } from './permissions.guard';

@Controller('protected')
@UseGuards(AuthorizationGuard, PermissionsGuard)
export class ProtectedController {
  @Get()
  getProtectedResource() {
    return { message: 'This is a protected resource' };
  }
}
```

## Configuración de Permisos en Auth0

1. **Definir Permisos:**
   - En el dashboard de Auth0, ve a "Applications" > "APIs" y selecciona tu API.
   - En la pestaña "Permissions", define los permisos que tu API puede aceptar (por ejemplo, `read:data`, `write:data`).

2. **Asignar Permisos a Roles:**
   - Ve a "Users & Roles" > "Roles" y crea roles con los permisos necesarios.
   - Asigna estos roles a los usuarios que necesiten acceso a los recursos protegidos.

## Prueba de la Integración

1. **Obtén un Token de Acceso:**
   - Usa el código proporcionado anteriormente para obtener un token de acceso desde Auth0.

2. **Realiza una Solicitud a la API:**
   - Usa el token de acceso en el encabezado `Authorization` de tus solicitudes a la API:

   ```bash
   curl --request GET \
     --url http://localhost:3000/protected \
     --header 'Authorization: Bearer <access_token>'
   ```


Las variables `envs.AUDIENCE`, `envs.AUTH0_ISSUER_BASE_URL`, y `envs.TOKEN_ALG` son variables de entorno que debes configurar en tu aplicación NestJS. Estas variables se utilizan para configurar la validación de tokens JWT con Auth0. A continuación te explico de dónde obtienes cada una de estas variables y cómo configurarlas:

---

### 1. **`envs.AUDIENCE`**
   - **¿Qué es?**
     - El `audience` es el identificador de la API que configuraste en Auth0. Es el valor que usaste cuando creaste la API en el dashboard de Auth0.
   - **¿Dónde lo encuentras?**
     - Ve al dashboard de Auth0.
     - Navega a **Applications > APIs**.
     - Selecciona la API que creaste.
     - El campo **Identifier** es el valor que debes usar como `AUDIENCE`.
   - **Ejemplo:**
     - Si el **Identifier** de tu API es `https://mi-api.com`, entonces `envs.AUDIENCE = 'https://mi-api.com'`.

---

### 2. **`envs.AUTH0_ISSUER_BASE_URL`**
   - **¿Qué es?**
     - El `issuer` es la URL del servidor de Auth0 que emite los tokens. Es la URL base de tu dominio de Auth0.
   - **¿Dónde lo encuentras?**
     - Ve al dashboard de Auth0.
     - En la esquina superior derecha, haz clic en tu perfil y selecciona **Settings**.
     - En la sección **Domain**, encontrarás el dominio de tu tenant de Auth0.
     - El valor de `AUTH0_ISSUER_BASE_URL` será `https://<TU_DOMINIO>.auth0.com/`.
   - **Ejemplo:**
     - Si tu dominio es `dev-xv0d8443yz5fq5k2.us.auth0.com`, entonces `envs.AUTH0_ISSUER_BASE_URL = 'https://dev-xv0d8443yz5fq5k2.us.auth0.com/'`.

---

### 3. **`envs.TOKEN_ALG`**
   - **¿Qué es?**
     - El `tokenSigningAlg` es el algoritmo de firma que se utiliza para firmar los tokens JWT. En Auth0, el algoritmo predeterminado es `RS256`.
   - **¿Dónde lo encuentras?**
     - Ve al dashboard de Auth0.
     - Navega a **Applications > APIs**.
     - Selecciona la API que creaste.
     - En la sección **Settings**, busca la opción **Token Signing Algorithm**.
     - El valor predeterminado es `RS256`, pero puedes cambiarlo si es necesario.
   - **Ejemplo:**
     - Si el algoritmo es `RS256`, entonces `envs.TOKEN_ALG = 'RS256'`.

---

### Cómo configurar estas variables en NestJS

Para usar estas variables en tu aplicación NestJS, debes definirlas en un archivo de configuración de entorno (por ejemplo, `.env`). Aquí te muestro cómo hacerlo:

1. **Crear un archivo `.env`:**
   - En la raíz de tu proyecto NestJS, crea un archivo llamado `.env`.
   - Define las variables de entorno en este archivo:

   ```env
   AUDIENCE=https://mi-api.com
   AUTH0_ISSUER_BASE_URL=https://dev-xv0d8443yz5fq5k2.us.auth0.com/
   TOKEN_ALG=RS256
   ```

2. **Cargar las variables de entorno en NestJS:**
   - Asegúrate de que tu aplicación NestJS esté configurada para cargar las variables de entorno desde el archivo `.env`. Puedes usar la librería `@nestjs/config` para esto.
   - Instala la librería si no la tienes:

     ```bash
     npm install @nestjs/config
     ```

   - Luego, configura el módulo `ConfigModule` en tu aplicación:

     ```typescript
     import { Module } from '@nestjs/common';
     import { ConfigModule } from '@nestjs/config';

     @Module({
       imports: [
         ConfigModule.forRoot({
           isGlobal: true, // Hace que las variables de entorno estén disponibles globalmente
         }),
       ],
     })
     export class AppModule {}
     ```

3. **Acceder a las variables de entorno:**
   - En tu archivo `authorization.guard.ts`, puedes acceder a las variables de entorno usando el servicio `ConfigService` de `@nestjs/config`:

     ```typescript
     import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
     import { auth, InvalidTokenError, UnauthorizedError } from 'express-oauth2-jwt-bearer';
     import { Request, Response } from 'express';
     import { promisify } from 'util';
     import { ConfigService } from '@nestjs/config';

     @Injectable()
     export class AuthorizationGuard implements CanActivate {
       constructor(private configService: ConfigService) {}

       async canActivate(context: ExecutionContext): Promise<boolean> {
         const request = context.switchToHttp().getRequest<Request>();
         const response = context.switchToHttp().getResponse<Response>();

         const validateAccessToken = promisify(auth({
           audience: this.configService.get<string>('AUDIENCE'),
           issuer: this.configService.get<string>('AUTH0_ISSUER_BASE_URL'),
           tokenSigningAlg: this.configService.get<string>('TOKEN_ALG'),
         }));

         try {
           await validateAccessToken(request, response);
           return true;
         } catch (error) {
           if (error instanceof InvalidTokenError) {
             throw new UnauthorizedException('Bad credentials');
           }
           if (error instanceof UnauthorizedError) {
             throw new UnauthorizedException('Authentication required');
           }
           throw new InternalServerErrorException();
         }
       }
     }
     ```

---

### Resumen

- **`AUDIENCE`**: Es el identificador de tu API en Auth0.
- **`AUTH0_ISSUER_BASE_URL`**: Es la URL base de tu tenant de Auth0.
- **`TOKEN_ALG`**: Es el algoritmo de firma de los tokens (normalmente `RS256`).

Estas variables deben estar definidas en tu archivo `.env` y se acceden a través del `ConfigService` en NestJS. Esto asegura que tu aplicación esté correctamente configurada para validar los tokens JWT emitidos por Auth0.

## Conclusión

Con esta configuración, tu API de NestJS estará protegida por Auth0, validando los tokens de acceso y verificando los permisos de los usuarios antes de permitir el acceso a los recursos protegidos.
