# Arquitectura del Sistema: Project-Personal-Services

**Org:** fedeira-personal-services
**Stack:** Node.js 20.x + TypeScript 5.7.3 + Serverless Framework 4.1.0
**Deploy:** AWS Lambda (us-east-2, stage: dev)
**HTTP Framework:** Fastify 5.x (microservicios HTTP) + `@fastify/aws-lambda`
**Patrón:** Clean Architecture + DDD, Repository Pattern, DI manual

---

## Sub-proyectos

### 1. authorization-services

Autenticación con JWT. Expone `POST /login` y un Lambda authorizer para validar tokens.

- **DynamoDB:** `UserCredentials` (email como HASH key)
- **Deps:** jsonwebtoken (HS256, 1h), bcryptjs
- **Lambdas:** `auth-service-authorizer`, `authorization-service`

### 2. account-services

CRUD de cuentas del usuario con contraseñas cifradas en reposo.

- **Endpoint:** `GET /accounts` (paginado con nextToken base64, filtrable por nombre)
- **DynamoDB:** `Accounts` (account + user como clave compuesta)
- **Cifrado:** AES-256-CBC via Node.js crypto

### 3. investment-services

Integración con la API externa de Portfolio Personal Inversiones (PPI).

- **Endpoint:** `GET /investment/available-balance`
- **Patrón:** OAuth2 token cacheado + retry exponencial (axios-retry, 3 intentos, 15s timeout)
- **Ambientes:** sandbox y producción con credenciales separadas

### 4. report-services

Recibe CSV por multipart y dispara proceso asíncrono de generación de reportes.

- **Endpoint:** `POST /reports/{email}` (requiere autenticación)
- **DynamoDB:** `ReportRequests` (id UUID, GSI por email, GSI por status)
- **S3:** `reports/request/{date}/{email}/{id}.csv`
- **SQS FIFO:** `ReportRequestsQueue.fifo` → desacopla upload de procesamiento
- **Estados:** NEW → IN_PROGRESS → FINISHED / ERROR / WARNING
- **Patrón canónico para nuevos microservicios HTTP Fastify**

### 5. report-processor (en desarrollo activo)

Lambda disparado por SQS. Procesa liquidaciones laborales de forma asíncrona.

- **Arquitectura interna:** Message Dispatcher con registro de handlers por `reportType`
- **Handler activo:** `GenerateLiquidationHandler` para `termination_liquidation`
- **Flujo completo:** DynamoDB (fetch) → S3 (leer CSV) → parsear → calcular → DynamoDB (status) → S3 (guardar resultado) → SES (email)
- **CSVServices:** papaparse, separador `;`, encoding latin1, headers en español → EmploymentData
- **LiquidationServices:** calcula indemnizaciones laborales (ver detalle abajo)
- **SQS:** batch size 1, max concurrency 10, visibility timeout 300s, max receive count 5 (luego DLQ)
- **Patrón canónico para nuevos microservicios SQS/async**

### 6. portfolio-services

Lambda functions para el backend del portfolio personal.

- **Comments:** `GET /portfolio/comments` (público) · `POST /portfolio/comments` (auth)
- **Email:** `POST /portfolio/send-email` (público) — envía email de contacto vía SES
- **Files (S3):** `POST /portfolio/files/upload` · `GET /portfolio/files` · `GET /portfolio/files/{fileName}` · `GET /portfolio/files/{fileName}/url` · `GET /portfolio/files/{fileName}/download` · `DELETE /portfolio/files/{fileName}`
- **DynamoDB:** `PortfolioComments` (commentId HASH)
- **S3:** bucket `dev-fedeira-personal-services-bucket`, prefijo `portfolio/`
- **Deps extra:** `busboy` para parsear multipart/form-data

### 7. common

Utilidades compartidas: `ResponseBuilder`, `ErrorHandler`, `axiosConfiguration` con retries.

---

## Estructura de Carpetas por Tipo de Microservicio

### Microservicio HTTP (Fastify) — patrón: `report-services/`

```
<service-name>/
├── app.ts                          ← Fastify app builder + DI + registro de rutas
├── lambda.ts                       ← Wrapper Lambda (@fastify/aws-lambda)
├── domain/
│   └── <Entity>.ts                 ← Tipos/interfaces de dominio, enums de estado
├── application/
│   ├── interfaces/
│   │   └── I<Entity>Repository.ts  ← Contrato de repositorio
│   └── usecases/
│       └── <Action><Entity>UseCase.ts  ← Lógica de negocio
└── infrastructure/
    ├── controllers/
    │   └── <Action><Entity>Controller.ts  ← Validación HTTP + llamada al use case
    └── repositories/
        ├── Dynamo<Entity>Repository.ts
        ├── S3Repository.ts
        └── SQSRepository.ts
```

### Microservicio Async/SQS — patrón: `report-processor/`

```
<processor-name>/
├── handler.ts          ← Lambda SQS entry point (SQSHandler, SQSBatchResponse)
├── dispatcher.ts       ← Router de mensajes por tipo + buildHandlersRegistry()
├── types/
│   └── types.ts        ← Envelope<T>, HandlerContext, tipos de dominio
├── config/
│   └── constants.ts    ← CONFIG con env vars tipadas
├── application/
│   ├── interfaces/
│   │   ├── IMessageHandler.ts
│   │   ├── I<Entity>Repository.ts
│   │   └── I<Service>.ts
│   └── domain/
│       └── <Entity>.ts
├── handlers/
│   └── <action><Entity>.ts  ← Implementa IMessageHandler
├── infrastructure/
│   ├── repositories/
│   │   └── Dynamo<Entity>Repository.ts
│   └── services/
│       └── <Domain>Services.ts
├── utils/
│   └── sqs.ts          ← parseEnvelope(), helpers de parseo
└── test/
    └── execute-sqs-<name>-handler.ts  ← Script para probar localmente
```

---

## Capas de la Arquitectura (Clean Architecture)

| Capa               | Carpeta                                                       | Responsabilidad                                                                       |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Domain**         | `domain/`                                                     | Modelos de datos puros, enums, tipos de negocio. Sin dependencias externas.           |
| **Application**    | `application/usecases/`, `application/interfaces/`            | Lógica de negocio, orquestación. Solo depende de interfaces (no de implementaciones). |
| **Infrastructure** | `infrastructure/controllers/`, `infrastructure/repositories/` | Implementaciones concretas: DynamoDB, S3, SQS, validaciones HTTP.                     |
| **Entry point**    | `app.ts` / `lambda.ts` / `handler.ts`                         | Bootstrapping: DI manual, wiring de dependencias, registro de rutas.                  |

**Regla de dependencias:** Domain ← Application ← Infrastructure. Las interfaces en `application/interfaces/` son contratos que define la aplicación y que infraestructura implementa.

---

## Patrones de Código

### Patrón: Lambda HTTP (Fastify)

**`app.ts`** — construye e instancia todo via DI manual:

```typescript
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  await app.register(multipart); // si es necesario

  // DI manual: instanciar repositorios → use cases → controllers
  const repo = new EntityRepository();
  const useCase = new DoSomethingUseCase(repo);
  const controller = new DoSomethingController(useCase);

  // Registrar rutas
  app.post('/resource/:param', async (request, reply) =>
    controller.handle(request, reply)
  );

  return app;
}
```

**`lambda.ts`** — wrapper estático para AWS Lambda (inicialización en frío una sola vez):

```typescript
const appPromise = buildApp().then(async (app) => {
  const proxy = awsLambdaFastify(app);
  await app.ready();
  return proxy;
});

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  const proxy = await appPromise;
  return proxy(event, context);
};
```

### Patrón: Controller (Fastify)

```typescript
export class DoSomethingController {
  constructor(private readonly useCase: DoSomethingUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { param } = request.params as { param: string };

    // Validaciones
    if (!isValidEmail(param)) {
      return reply.status(400).send(buildResponse.ErrorHandler.handle(new Error('Invalid param')));
    }

    const result = await this.useCase.execute(param, ...);
    return reply.status(201).send(buildResponse.buildResponse('success', 201, result));
  }
}
```

### Patrón: Use Case

```typescript
export class DoSomethingUseCase {
  constructor(
    private readonly entityRepository: IEntityRepository,
    private readonly s3Repository: IS3Repository, // solo si aplica
    private readonly sqsRepository: ISQSRepository // solo si aplica
  ) {}

  async execute(input: InputType): Promise<OutputType> {
    // 1. Lógica de negocio
    // 2. Llamar repositorios via interfaces
    // 3. Retornar resultado
  }
}
```

### Patrón: Lambda SQS (handler.ts)

```typescript
export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];
  for (const record of event.Records) {
    try {
      await processSQSMessage(record);
    } catch (err) {
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures };
};
```

`functionResponseType: ReportBatchItemFailures` en serverless.yml activa el partial batch failure reporting.

### Patrón: Dispatcher (registro de handlers por tipo de mensaje)

```typescript
export function buildHandlersRegistry(): Map<string, IMessageHandler<unknown>> {
  const repo = new EntityRepository();
  const service = new DomainService();
  const context: HandlerContext = { repo, service };

  const handlers: IMessageHandler[] = [new MyHandler(context)];
  const registry = new Map<string, IMessageHandler>();
  handlers.forEach((h) => registry.set(h.type, h));
  return registry;
}
```

### Patrón: Message Handler

```typescript
export class MyHandler implements IMessageHandler<MyPayload> {
  readonly type = 'my_message_type';

  constructor(private readonly ctx: HandlerContext) {}

  async handle(payload: MyPayload): Promise<void> {
    // 1. Fetch entidad desde DynamoDB
    // 2. Obtener archivo desde S3
    // 3. Procesar
    // 4. Actualizar estado en DynamoDB
    // 5. Guardar resultado en S3
    // 6. Enviar email via SES (si aplica)
  }
}
```

### Patrón: Repository

```typescript
export class EntityRepository implements IEntityRepository {
  private readonly client: DocumentClient;

  constructor() {
    this.client = new DynamoDB.DocumentClient(
      process.env.IS_OFFLINE === 'true'
        ? { region: 'localhost', endpoint: 'http://localhost:8000' }
        : {}
    );
  }

  async createEntity(entity: Entity): Promise<string> {
    await this.client
      .put({ TableName: process.env.TABLE_NAME!, Item: entity })
      .promise();
    return entity.id;
  }
}
```

---

## Respuestas HTTP — ResponseBuilder

Usar siempre `common/utils/ResponseBuilder.ts`:

```typescript
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';

// Éxito:
reply.status(201).send(buildResponse('success', 201, data));

// Error manejado:
reply.status(400).send(ErrorHandler.handle(new Error('mensaje')));
```

`ErrorHandler.handle()` retorna `{ statusCode, body }` con status 500 por defecto o el código del error si tiene `statusCode`.

---

## Logging y Observabilidad

- Fastify tiene logger integrado (`app = Fastify({ logger: true })`). Usar `request.log.info()`, `request.log.error()` dentro de controllers.
- En lambdas SQS y handlers usar `console.log()` / `console.error()` directamente (CloudWatch captura stdout).
- Ejemplos del código base:
  - `console.log('[Handler] Building message handler registry...')`
  - `console.error('[Repository] Error:', error)`
- X-Ray tracing está habilitado en el provider (no requiere instrumentación adicional para la mayoría de casos).
- Logs de API Gateway: retención 30 días, CloudWatch.

---

## Manejo de Errores

| Patrón           | Dónde      | Cómo                                                                  |
| ---------------- | ---------- | --------------------------------------------------------------------- |
| Validación HTTP  | Controller | `return reply.status(400).send(ErrorHandler.handle(error))`           |
| Error de negocio | Use Case   | `throw new Error('mensaje descriptivo')`                              |
| Error de infra   | Repository | `catch (error) { console.error(...); throw error; }` — dejar que suba |
| SQS failure      | handler.ts | Agregar `{ itemIdentifier: record.messageId }` a `batchItemFailures`  |

---

## Organización de Imports

**Regla obligatoria:** separar dependencias externas de internas con comentarios.

```typescript
// External Dependencies:
import Fastify from 'fastify';
import { S3 } from 'aws-sdk';

// Internal Dependencies:
import { MyRepository } from './infrastructure/repositories/MyRepository';
import { MyUseCase } from './application/usecases/MyUseCase';
```

---

## Variables de Entorno

| Variable                                       | Descripción                      | Fuente en prod                                      |
| ---------------------------------------------- | -------------------------------- | --------------------------------------------------- |
| `IS_OFFLINE`                                   | `'true'` local, `'false'` prod   | hardcoded en yml                                    |
| `JWT_SECRET`                                   | Secreto JWT                      | SSM `/fedeira-personal-services/auth/jwt/secret`    |
| `USER_EMAIL` / `USER_PASSWORD`                 | Credenciales de usuario          | SSM                                                 |
| `ENCRYPTION_KEY`                               | Clave AES-256 (64 chars hex)     | SSM                                                 |
| `AWS_REPORTS_BUCKET`                           | Nombre del bucket S3 de reportes | env var                                             |
| `AWS_REPORT_REQUESTS_QUEUE_URL`                | URL SQS FIFO                     | `!Ref ReportRequestsQueue` en prod / `.env` offline |
| `REPORT_REQUESTS_TABLE`                        | Nombre tabla DynamoDB            | hardcoded `ReportRequests`                          |
| `PORTFOLIO_COMMENTS_TABLE`                     | Nombre tabla DynamoDB            | hardcoded `PortfolioComments`                       |
| `PORTFOLIO_FROM_EMAIL` / `PORTFOLIO_TO_EMAIL`  | Emails SES                       | SSM                                                 |
| `ACCOUNT_NUMBER_PPI`, `CLIENT_KEY_PPI_*`, etc. | Credenciales PPI                 | SSM / `.env`                                        |

**Patrón SSM en serverless.yml:**

```yaml
JWT_SECRET: ${env:JWT_SECRET, ssm:/fedeira-personal-services/auth/jwt/secret}
```

Primero intenta `env var`, si no existe usa SSM.

**Para un microservicio nuevo** declarar las variables en ambos archivos yml y en `.env`.

---

## Infraestructura AWS

| Servicio            | Uso                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Lambda              | Una función por microservicio (HTTP) + una por handler SQS                                                                |
| API Gateway         | REST API unificada con Lambda authorizer TOKEN-based, CORS habilitado                                                     |
| DynamoDB            | Tablas: UserCredentials, Accounts, ReportRequests, PortfolioComments                                                      |
| S3                  | `dev-fedeira-personal-services-bucket` (portfolio, general) + `dev-fedeira-personal-services-reports` (CSVs y resultados) |
| SQS FIFO            | Cola + DLQ, visibilityTimeout 300s, retención 14 días, maxReceiveCount 5                                                  |
| SES                 | Envío del reporte generado por email                                                                                      |
| SSM Parameter Store | Secretos en producción                                                                                                    |
| CloudWatch + X-Ray  | Logs 30 días + tracing                                                                                                    |

**Regla arquitectónica:** 1 Lambda por microservicio HTTP (Fastify maneja routing interno). Los SQS processors son Lambdas separadas.

---

## Dominio de Liquidación Laboral (report-processor)

**Modelos clave:**

- `EmploymentData`: grossSalary, bestMonthlySalary, recordedStartDate, realStartDate, endDate, includePriorNotice, previousVacationBalance, buenosAires, registered
- `SeniorityAndTerminationData`: años/meses/días de antigüedad, desglose del mes de egreso

**Cálculos implementados en LiquidationServices:**

- Salario base diario, días trabajados en mes de egreso
- SAC proporcional (lógica diferente para Buenos Aires)
- Vacaciones proporcionales + SAC sobre vacaciones
- Indemnización por antigüedad (1 salario/año, +1 si meses ≥ 3) + SAC
- Preaviso (30 días de salario base, si `includePriorNotice`) + SAC
- Integración (días pendientes) + SAC

**Días de vacaciones por antigüedad:** ≤5 años: 14d · ≤10: 21d · ≤20: 28d · >20: 35d

**CSV headers (español → EmploymentData):** separador `;`, encoding `latin1`, papaparse.

---

## Flujo General del Sistema

```
Usuario
  │
  ├─► POST /login ──────────────────────► authorization-services ──► JWT token
  │
  ├─► GET /investment/available-balance ► investment-services ──────► PPI API (externa)
  │
  ├─► GET /accounts ────────────────────► account-services ──────────► DynamoDB
  │
  └─► POST /reports/{email} ────────────► report-services (Fastify)
            │ (CSV upload)                    │
            │                          S3 + DynamoDB + SQS FIFO
            │                                │
            └──────────────────────────────► report-processor (async Lambda)
                                                  │
                                          Leer CSV → Calcular liquidación
                                          → DynamoDB (status) → S3 (resultado)
                                          → SES (email al usuario)
```

---

## Cómo Agregar un Endpoint Nuevo

Ver guía completa: `.claude/commands/new-services.md` o ejecutar `/new-services`.

**Resumen:**

1. Agregar tipo en `domain/<Entity>.ts`
2. Agregar método en `application/interfaces/IEntityRepository.ts`
3. Implementar en `infrastructure/repositories/EntityRepository.ts`
4. Crear/actualizar `application/usecases/<Action>EntityUseCase.ts`
5. Crear/actualizar `infrastructure/controllers/<Action>EntityController.ts`
6. Registrar ruta en `app.ts`
7. Agregar variable de entorno en ambos `serverless.yml` si aplica

## Cómo Agregar un Microservicio Nuevo

Ver guía detallada: `.claude/commands/new-services.md` o ejecutar `/new-services`.

---

## Desarrollo Local

```bash
# Prerrequisitos: Node 20, Docker, AWS CLI, Serverless Framework
npm install
cp .env.example .env  # completar valores

# DynamoDB local (Docker)
npm run offline-db-init      # inicia contenedor DynamoDB
npm run offline-db-verify    # verifica que esté corriendo
npm run offline-db-migrate   # crea tablas

# Seed de datos de prueba
npm run insert-user
npm run insert-accounts

# Levantar API (http://localhost:3000)
npm run offline

# Probar report-processor directamente (sin stack completo)
dotenv -e .env -- ts-node report-processor/test/execute-sqs-report-processor-handler.ts
```

### Variables de entorno mínimas para modo offline (`.env`)

```env
IS_OFFLINE=true
JWT_SECRET=<cualquier string>
USER_EMAIL=xxxx@gmail.com
USER_PASSWORD=<bcrypt hash>
ENCRYPTION_KEY=<64 chars hex>
ENCRYPTION_ALGORITHM=aes-256-cbc
ENCRYPTION_RANDOM_BYTES=16
AWS_REPORTS_BUCKET=dev-fedeira-personal-services-reports
AWS_REPORT_REQUESTS_QUEUE_URL=http://localhost:9324/000000000000/ReportRequestsQueue.fifo
REPORT_REQUESTS_TABLE=ReportRequests
```

---

## Documentación del Proyecto

| Archivo                                                             | Descripción                                                |
| ------------------------------------------------------------------- | ---------------------------------------------------------- |
| `common/docs/README.md`                                             | Guía completa de instalación, ejecución local y despliegue |
| `common/docs/architecture.png`                                      | Diagrama visual de la arquitectura                         |
| `common/docs/architecture.drawio`                                   | Diagrama editable (draw.io)                                |
| `common/docs/Project Personal Services API.postman_collection.json` | Colección Postman                                          |

---

## Estado del Desarrollo (al 2026-03-19)

**Rama activa:** `Task/Faros-ai`

### Completado

- Parser CSV (papaparse, latin1, separador `;`)
- Cálculos de liquidación: días trabajados, SAC proporcional, vacaciones, antigüedad, preaviso, integración
- Message Dispatcher con handler registry extensible
- Scaffolding completo del pipeline
- Portfolio services completo (comments, email, files S3)

### Pendiente

- Persistir resultado de liquidación en DynamoDB (actualizar status)
- Guardar reporte generado en S3 (`reports/response/{date}/{email}/{id}.json`)
- Envío del reporte por SES
- Remover mock data y conectar con CSV real
- Tests de los cálculos de liquidación
- Faros AI service (word cloud)
