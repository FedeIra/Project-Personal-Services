# Project-Personal-Services — Copilot Instructions

**Org:** fedeira-personal-services
**Stack:** Node.js 20.x + TypeScript 5.7.3 + Serverless Framework 4.1.0
**Deploy:** AWS Lambda (us-east-2, stage: dev)
**HTTP Framework:** Fastify 5.x (microservicios HTTP) + `@fastify/aws-lambda`
**Patrón:** Clean Architecture + DDD, Repository Pattern, DI manual

---

## Overview y Responsabilidades por Módulo

| Módulo | Responsabilidad | Tipo Lambda |
|--------|----------------|-------------|
| `authorization-services/` | JWT login + Lambda authorizer (verifica Bearer token) | HTTP |
| `account-services/` | Cuentas cifradas en DynamoDB (AES-256-CBC) | HTTP |
| `investment-services/` | Proxy hacia API externa PPI (OAuth2 + retry) | HTTP |
| `report-services/` | Upload CSV multipart → S3 + DynamoDB + SQS | HTTP (Fastify) |
| `report-processor/` | Procesa mensajes SQS: liquidación laboral | SQS trigger |
| `portfolio-services/` | Comments, email SES, archivos S3 del portfolio | HTTP (Fastify) |
| `common/` | Utilitarios compartidos: ResponseBuilder, ErrorHandler, axiosConfiguration | — |

---

## Estructura de Carpetas

### Microservicio HTTP (Fastify) — patrón canónico: `report-services/`

```
<service-name>/
├── app.ts                              ← Fastify builder + DI manual + rutas
├── lambda.ts                           ← Wrapper Lambda con @fastify/aws-lambda
├── domain/
│   └── <Entity>.ts                     ← Tipos de dominio, enums de estado
├── application/
│   ├── interfaces/
│   │   └── I<Entity>Repository.ts      ← Contratos (interfaces)
│   └── usecases/
│       └── <Action><Entity>UseCase.ts  ← Lógica de negocio
└── infrastructure/
    ├── controllers/
    │   └── <Action><Entity>Controller.ts  ← Validación HTTP + llamada al use case
    └── repositories/
        ├── Dynamo<Entity>Repository.ts
        ├── S3Repository.ts             ← si aplica
        └── SQSRepository.ts            ← si aplica
```

### Microservicio SQS/Async — patrón canónico: `report-processor/`

```
<processor-name>/
├── handler.ts           ← SQSHandler entry point, SQSBatchResponse
├── dispatcher.ts        ← Router de mensajes por tipo + buildHandlersRegistry()
├── types/types.ts       ← Envelope<T>, HandlerContext, tipos de payload
├── config/constants.ts  ← CONFIG con env vars tipadas
├── application/
│   ├── interfaces/      ← IMessageHandler, I<Repo>, I<Service>
│   └── domain/          ← Modelos de dominio
├── handlers/
│   └── <action><Entity>.ts  ← implements IMessageHandler
├── infrastructure/
│   ├── repositories/    ← DynamoDB, S3
│   └── services/        ← Servicios de dominio (CSV parsing, cálculos)
├── utils/sqs.ts         ← parseEnvelope(), helpers SQS
└── test/
    └── execute-sqs-<name>-handler.ts  ← Script de prueba local
```

---

## Capas de la Arquitectura

| Capa | Carpeta | Regla |
|------|---------|-------|
| Domain | `domain/` | Sin dependencias externas. Solo tipos e interfaces de negocio. |
| Application | `application/` | Depende solo de interfaces. Contiene use cases y contratos. |
| Infrastructure | `infrastructure/` | Implementaciones concretas (DynamoDB, S3, SQS, validaciones). |
| Entry point | `app.ts` / `handler.ts` | Bootstrapping + DI manual. |

**Dirección de dependencias:** Domain ← Application ← Infrastructure ← Entry point

---

## Convenciones de Naming

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos TypeScript | PascalCase | `CreateReportRequestUseCase.ts` |
| Interfaces | Prefijo `I` | `IReportRequestRepository` |
| Clases | PascalCase | `CreateReportRequestController` |
| Variables de entorno | UPPER_SNAKE_CASE | `AWS_REPORTS_BUCKET` |
| Funciones exportadas del handler Lambda | camelCase | `handler`, `authorizer`, `login` |
| Handler property en serverless.yml | `<folder>/handler.<exportName>` | `report-services/lambda.handler` |
| Nombre de función Lambda (name) | `dev-fedeira-<service>` | `dev-fedeira-report-services` |

---

## Estándares de Código

### Imports — separar externos de internos (obligatorio)

```typescript
// External Dependencies:
import Fastify from 'fastify';
import { S3 } from 'aws-sdk';

// Internal Dependencies:
import { MyUseCase } from './application/usecases/MyUseCase';
```

### TypeScript
- Strict mode habilitado (`tsconfig.json`)
- Target ES2020, Module CommonJS
- Non-null assertions (`!`) cuando se tiene certeza de que el valor existe
- Evitar `any`; usar tipos específicos o `unknown`

### Linting
- ESLint + Prettier configurados (ver `.eslintrc`, `.prettierrc` en raíz)
- `npm run build` compila con `tsc` → `./dist`

---

## Patrones de Código

### Lambda HTTP — `app.ts`

```typescript
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  await app.register(multipart); // para uploads

  // DI manual
  const repo = new EntityRepository();
  const useCase = new DoSomethingUseCase(repo);
  const controller = new DoSomethingController(useCase);

  app.post('/resource/:param', async (req, reply) => controller.handle(req, reply));
  return app;
}
```

### Lambda HTTP — `lambda.ts`

```typescript
const appPromise = buildApp().then(async (app) => {
  const proxy = awsLambdaFastify(app);
  await app.ready();
  return proxy;
});

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  const proxy = await appPromise;
  return proxy(event, context);
};
```

### Controller (Fastify)

```typescript
export class DoSomethingController {
  constructor(private readonly useCase: DoSomethingUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { param } = request.params as { param: string };
    // validar → ejecutar use case → responder
    const result = await this.useCase.execute(param);
    return reply.status(201).send(buildResponse('success', 201, result));
  }
}
```

### Respuestas HTTP — siempre usar ResponseBuilder

```typescript
import { buildResponse, ErrorHandler } from '../../../common/utils/ResponseBuilder';

reply.status(200).send(buildResponse('success', 200, data));
reply.status(400).send(ErrorHandler.handle(new Error('mensaje')));
```

### Repository — cambio de endpoint offline/prod

```typescript
constructor() {
  this.client = new DynamoDB.DocumentClient(
    process.env.IS_OFFLINE === 'true'
      ? { region: 'localhost', endpoint: 'http://localhost:8000' }
      : {}
  );
}
```

### Lambda SQS — partial batch failure

```typescript
export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];
  for (const record of event.Records) {
    try {
      await processRecord(record);
    } catch {
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures };
};
```

---

## Manejo de Configuración y Secretos

**Local (offline):** variables en `.env`, cargadas via `useDotenv: true` en `serverless.offline.yml`.

**Producción:** SSM Parameter Store, path `ssm:/fedeira-personal-services/<ruta>`.

**Patrón en serverless.yml:**
```yaml
JWT_SECRET: ${env:JWT_SECRET, ssm:/fedeira-personal-services/auth/jwt/secret}
```
Prioridad: variable de entorno → SSM.

**CONFIG pattern** (report-processor):
```typescript
export const CONFIG = {
  IS_OFFLINE: process.env.IS_OFFLINE === 'true',
  REPORT_REQUESTS_TABLE: process.env.REPORT_REQUESTS_TABLE!,
  AWS_REPORTS_BUCKET: process.env.AWS_REPORTS_BUCKET!,
  JWT_SECRET: process.env.JWT_SECRET!,
};
```

---

## Serverless: Offline vs Deploy

### serverless.offline.yml (desarrollo local)
- Plugins: `serverless-dynamodb-local` + `serverless-offline`
- `useDotenv: true` — carga `.env` automáticamente
- DynamoDB local: puerto 8000, in-memory
- SQS local: `http://localhost:9324` (ElasticMQ)
- No usa SSM — todas las variables desde `.env`

### serverless.yml (producción)
- Profile: `Developer-Fedeira` (AWS CLI)
- Runtime: `nodejs20.x`, región `us-east-2`, stage `dev`
- Logs: CloudWatch con retención 30 días
- Tracing: X-Ray habilitado en API Gateway y Lambda
- IAM statements: SSM, DynamoDB, S3, SQS, SES, CloudWatch Logs
- `binaryMediaTypes: ['multipart/form-data']` para uploads CSV

### Comandos

```bash
npm run offline           # Levantar API local (http://localhost:3000)
npm run offline-db-init   # Iniciar DynamoDB Docker
npm run offline-db-migrate # Crear tablas locales
npm run deploy            # Deploy a AWS
npm run build             # Compilar TypeScript
```

---

## Cómo Agregar un Endpoint Nuevo (resumen)

1. Agregar tipo en `domain/<Entity>.ts`
2. Declarar método en `application/interfaces/I<Entity>Repository.ts`
3. Implementar método en `infrastructure/repositories/Dynamo<Entity>Repository.ts`
4. Crear `application/usecases/<Action><Entity>UseCase.ts`
5. Crear `infrastructure/controllers/<Action><Entity>Controller.ts`
6. Registrar ruta en `app.ts` (inyectar dependencias)
7. Agregar variables de entorno en ambos serverless yml si aplica

## Cómo Agregar un Microservicio Nuevo (resumen)

1. Crear carpeta `<service-name>/` con estructura Clean Architecture
2. Crear `app.ts` + `lambda.ts` (HTTP) o `handler.ts` + `dispatcher.ts` (SQS)
3. Crear `domain/`, `application/`, `infrastructure/`
4. Agregar función en `serverless.yml` y `serverless.offline.yml`
5. Declarar recursos AWS (DynamoDB, S3, SQS) en `resources:` si son nuevos
6. Agregar variables de entorno en ambos yml y en `.env`
7. Actualizar `tsconfig.json` → `include` array si la carpeta no está cubierta

Ver guía completa: `.github/skills/new-services/SKILL.md`

---

## Logging y Observabilidad

- **Fastify:** logger integrado. Usar `request.log.info()` / `request.log.error()` en controllers.
- **SQS handlers:** `console.log()` / `console.error()` — CloudWatch captura stdout/stderr.
- **X-Ray:** tracing automático vía configuración del provider (no requiere instrumentación manual).
- **CloudWatch:** logs de API Gateway y Lambda, retención 30 días.

---

## Infraestructura AWS

| Servicio | Recurso | Nombre |
|----------|---------|--------|
| DynamoDB | UserCredentials | HASH: email |
| DynamoDB | Accounts | HASH: account, RANGE: user |
| DynamoDB | ReportRequests | HASH: id, GSI: ByEmail, ByStatus |
| DynamoDB | PortfolioComments | HASH: commentId |
| S3 | dev-fedeira-personal-services-bucket | general + portfolio |
| S3 | dev-fedeira-personal-services-reports | CSVs + resultados |
| SQS FIFO | ReportRequestsQueue.fifo | visibilityTimeout: 300s, maxReceive: 5 |
| SQS FIFO | ReportRequestsDeadLetterQueue.fifo | retención 14 días |

---

## Documentación de Referencia

| Archivo | Descripción |
|---------|-------------|
| `common/docs/README.md` | Setup completo: instalación, offline, deploy |
| `common/docs/architecture.png` | Diagrama del sistema |
| `.github/skills/new-services/SKILL.md` | Guía para crear microservicios nuevos |
| `.claude/CLAUDE.md` | Instrucciones para Claude Code |
