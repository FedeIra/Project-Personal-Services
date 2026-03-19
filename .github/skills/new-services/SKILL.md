# Skill: new-services

## Descripción

Guía interactiva paso a paso para crear un microservicio nuevo en **Project-Personal-Services**, tomando como modelo canónico `report-services` (Fastify HTTP) y `report-processor` (SQS async).

**Regla arquitectónica principal:** una sola Lambda por microservicio. Fastify maneja el routing interno para microservicios HTTP.

---

## Activación

Este skill se activa cuando el usuario quiere:
- Crear un microservicio nuevo desde cero
- Agregar un endpoint nuevo a un servicio existente
- Entender cómo conectar serverless.yml con el código

---

## Tutorial Completo

### Paso 0 — Determinar el tipo

Preguntar al usuario:

> **¿Qué tipo de microservicio necesitás crear?**
> - **A) HTTP (Fastify):** expone endpoints REST via API Gateway. Modelo: `report-services/`.
> - **B) SQS/Async:** procesa mensajes de una cola SQS. Modelo: `report-processor/`.

---

## TIPO A: Microservicio HTTP (Fastify)

### Estructura final

```
<service-name>/
├── app.ts                                      ← Fastify builder + DI + rutas
├── lambda.ts                                   ← Entry point Lambda
├── domain/
│   └── <Entity>.ts                             ← Tipos de dominio, enums
├── application/
│   ├── interfaces/
│   │   └── I<Entity>Repository.ts              ← Contrato del repositorio
│   └── usecases/
│       └── <Action><Entity>UseCase.ts          ← Lógica de negocio
└── infrastructure/
    ├── controllers/
    │   └── <Action><Entity>Controller.ts       ← Validación + respuesta HTTP
    └── repositories/
        ├── Dynamo<Entity>Repository.ts         ← DynamoDB
        ├── S3Repository.ts                     ← S3 (si aplica)
        └── SQSRepository.ts                    ← SQS (si aplica)
```

---

### 1. Dominio — `domain/<Entity>.ts`

Define los tipos de negocio sin dependencias externas:

```typescript
export interface MyEntity {
  id: string;
  name: string;
  status: MyEntityStatus;
  createdAt: string;
  updatedAt: string;
}

export enum MyEntityStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DONE = 'DONE',
}
```

---

### 2. Interfaz de repositorio — `application/interfaces/IMyEntityRepository.ts`

Contrato que define qué operaciones de datos necesita la aplicación:

```typescript
// Internal Dependencies:
import { MyEntity } from '../../domain/MyEntity';

export interface IMyEntityRepository {
  createMyEntity(entity: MyEntity): Promise<string>;
  getMyEntityById(id: string): Promise<MyEntity | null>;
  updateMyEntityStatus(id: string, status: MyEntityStatus): Promise<void>;
}
```

---

### 3. Use Case — `application/usecases/CreateMyEntityUseCase.ts`

Lógica de negocio pura. Solo depende de interfaces, nunca de implementaciones:

```typescript
// External Dependencies:
import { v4 as uuidv4 } from 'uuid';

// Internal Dependencies:
import { IMyEntityRepository } from '../interfaces/IMyEntityRepository';
import { MyEntity, MyEntityStatus } from '../../domain/MyEntity';

export class CreateMyEntityUseCase {
  constructor(private readonly myEntityRepository: IMyEntityRepository) {}

  async execute(name: string): Promise<string> {
    const now = new Date().toISOString();
    const entity: MyEntity = {
      id: uuidv4(),
      name,
      status: MyEntityStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };
    return this.myEntityRepository.createMyEntity(entity);
  }
}
```

---

### 4. Repository — `infrastructure/repositories/DynamoMyEntityRepository.ts`

Implementación concreta de la interfaz. Gestiona el switch offline/prod:

```typescript
// External Dependencies:
import DynamoDB from 'aws-sdk/clients/dynamodb';

// Internal Dependencies:
import { IMyEntityRepository } from '../../application/interfaces/IMyEntityRepository';
import { MyEntity, MyEntityStatus } from '../../domain/MyEntity';

export class MyEntityRepository implements IMyEntityRepository {
  private readonly client: DynamoDB.DocumentClient;
  private readonly tableName: string;

  constructor() {
    this.client = new DynamoDB.DocumentClient(
      process.env.IS_OFFLINE === 'true'
        ? { region: 'localhost', endpoint: 'http://localhost:8000' }
        : {}
    );
    this.tableName = process.env.MY_ENTITY_TABLE!;
  }

  async createMyEntity(entity: MyEntity): Promise<string> {
    await this.client
      .put({ TableName: this.tableName, Item: entity })
      .promise();
    return entity.id;
  }

  async getMyEntityById(id: string): Promise<MyEntity | null> {
    const result = await this.client
      .get({ TableName: this.tableName, Key: { id } })
      .promise();
    return (result.Item as MyEntity) ?? null;
  }

  async updateMyEntityStatus(id: string, status: MyEntityStatus): Promise<void> {
    await this.client.update({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: 'SET #s = :s, updatedAt = :ua',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: {
        ':s': status,
        ':ua': new Date().toISOString(),
      },
    }).promise();
  }
}
```

---

### 5. Controller — `infrastructure/controllers/CreateMyEntityController.ts`

Valida el request HTTP y delega al use case. Usa siempre `ResponseBuilder`:

```typescript
// External Dependencies:
import { FastifyRequest, FastifyReply } from 'fastify';

// Internal Dependencies:
import { CreateMyEntityUseCase } from '../../application/usecases/CreateMyEntityUseCase';
import { buildResponse, ErrorHandler } from '../../../common/utils/ResponseBuilder';

interface CreateMyEntityBody {
  name: string;
}

export class CreateMyEntityController {
  constructor(private readonly useCase: CreateMyEntityUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const body = request.body as CreateMyEntityBody;

    if (!body?.name || typeof body.name !== 'string' || body.name.trim() === '') {
      return reply.status(400).send(
        ErrorHandler.handle(new Error('name is required and must be a non-empty string'))
      );
    }

    const id = await this.useCase.execute(body.name.trim());
    return reply.status(201).send(buildResponse('success', 201, { id }));
  }
}
```

---

### 6. `app.ts` — DI manual + registro de rutas

```typescript
// External Dependencies:
import Fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';  // solo si maneja uploads

// Internal Dependencies:
import { MyEntityRepository } from './infrastructure/repositories/DynamoMyEntityRepository';
import { CreateMyEntityUseCase } from './application/usecases/CreateMyEntityUseCase';
import { CreateMyEntityController } from './infrastructure/controllers/CreateMyEntityController';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  // await app.register(multipart); // descomentar si se necesita multipart

  // DI manual: instanciar de adentro hacia afuera
  const myEntityRepository = new MyEntityRepository();
  const createMyEntityUseCase = new CreateMyEntityUseCase(myEntityRepository);
  const createMyEntityController = new CreateMyEntityController(createMyEntityUseCase);

  // Rutas
  app.post('/my-entities', async (request, reply) =>
    createMyEntityController.handle(request, reply)
  );

  return app;
}
```

---

### 7. `lambda.ts` — Wrapper Lambda

Inicialización en frío una sola vez (patrón singleton con Promise):

```typescript
// External Dependencies:
import awsLambdaFastify from '@fastify/aws-lambda';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// Internal Dependencies:
import { buildApp } from './app';

const appPromise = buildApp().then(async (app) => {
  const proxy = awsLambdaFastify(app);
  await app.ready();
  return proxy;
});

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<unknown> => {
  const proxy = await appPromise;
  return proxy(event, context);
};
```

---

### 8. `serverless.yml` — Función + recursos

**En `functions:`:**
```yaml
my-service:
  handler: my-service-name/lambda.handler
  name: 'dev-fedeira-my-service-name'
  timeout: 29
  memorySize: 1024
  events:
    - http:
        path: my-entities
        method: post
        cors: true
        authorizer:          # omitir si es endpoint público
          name: auth-service-authorizer
          type: TOKEN
    - http:
        path: my-entities/{id}
        method: get
        cors: true
        authorizer:
          name: auth-service-authorizer
          type: TOKEN
```

**En `provider: environment:`:**
```yaml
MY_ENTITY_TABLE: MyEntities
MY_CUSTOM_SECRET: ${env:MY_CUSTOM_SECRET, ssm:/fedeira-personal-services/my-service/secret}
```

**En `resources: Resources:`** (nueva tabla DynamoDB):
```yaml
MyEntityTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: MyEntities
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    BillingMode: PAY_PER_REQUEST
    # GSI opcional:
    GlobalSecondaryIndexes:
      - IndexName: ByStatus
        KeySchema:
          - AttributeName: status
            KeyType: HASH
          - AttributeName: createdAt
            KeyType: RANGE
        Projection:
          ProjectionType: ALL
```

**En `iam: role: statements:`** (agregar permisos para la nueva tabla):
```yaml
- Effect: 'Allow'
  Action:
    - 'dynamodb:Query'
    - 'dynamodb:Scan'
    - 'dynamodb:GetItem'
    - 'dynamodb:PutItem'
    - 'dynamodb:UpdateItem'
    - 'dynamodb:DeleteItem'
  Resource:
    - !Sub 'arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/MyEntities'
    - !Sub 'arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/MyEntities/index/*'
```

---

### 9. `serverless.offline.yml` — Configuración local

**En `functions:`:**
```yaml
my-service:
  handler: my-service-name/lambda.handler
  events:
    - http:
        path: my-entities
        method: post
        cors: true
        authorizer:
          name: auth-service-authorizer
          type: TOKEN
```

**En `provider: environment:`:**
```yaml
MY_ENTITY_TABLE: MyEntities
MY_CUSTOM_SECRET: ${env:MY_CUSTOM_SECRET}
```

**En `resources: Resources:`** (mismo schema que prod):
```yaml
MyEntityTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: MyEntities
    AttributeDefinitions:
      - AttributeName: id
        AttributeType: S
    KeySchema:
      - AttributeName: id
        KeyType: HASH
    BillingMode: PAY_PER_REQUEST
```

---

### 10. Variables de entorno — `.env`

```env
# Nuevo microservicio
MY_ENTITY_TABLE=MyEntities
MY_CUSTOM_SECRET=local-secret-value
```

### 11. `tsconfig.json`

Si la carpeta nueva no está cubierta por el `include` existente, agregar:
```json
{
  "include": ["my-service-name/**/*", ...]
}
```

---

## TIPO B: Microservicio SQS/Async

### Estructura final

```
<processor-name>/
├── handler.ts                          ← SQSHandler + SQSBatchResponse
├── dispatcher.ts                       ← Router de mensajes + buildHandlersRegistry()
├── types/types.ts                      ← Envelope<T>, HandlerContext, payloads
├── config/constants.ts                 ← CONFIG con env vars tipadas
├── application/
│   ├── interfaces/
│   │   ├── IMessageHandler.ts
│   │   └── I<Entity>Repository.ts
│   └── domain/<Entity>.ts
├── handlers/<action><Entity>.ts        ← IMessageHandler concreto
├── infrastructure/
│   ├── repositories/Dynamo<Entity>Repository.ts
│   └── services/<Domain>Services.ts
├── utils/sqs.ts                        ← parseEnvelope()
└── test/execute-sqs-<name>-handler.ts  ← Prueba local
```

---

### 1. Tipos (`types/types.ts`)

```typescript
export type Envelope<T = unknown> = {
  version?: string;
  payload: T;
};

export type MyProcessorPayload = {
  id: string;
  messageType: string;
};

export interface HandlerContext {
  myRepository: IMyRepository;
  myService: IMyService;
}
```

---

### 2. Config (`config/constants.ts`)

```typescript
export const CONFIG = {
  IS_OFFLINE: process.env.IS_OFFLINE === 'true',
  MY_TABLE: process.env.MY_ENTITY_TABLE!,
  AWS_BUCKET: process.env.AWS_BUCKET!,
};
```

---

### 3. IMessageHandler (`application/interfaces/IMessageHandler.ts`)

```typescript
export interface IMessageHandler<T = unknown> {
  readonly type: string;
  handle(payload: T): Promise<void>;
}
```

---

### 4. Message Handler (`handlers/myHandler.ts`)

```typescript
// External Dependencies:
// (las necesarias)

// Internal Dependencies:
import { IMessageHandler } from '../application/interfaces/IMessageHandler';
import { MyProcessorPayload, HandlerContext } from '../types/types';

export class MyHandler implements IMessageHandler<MyProcessorPayload> {
  readonly type = 'my_message_type';

  constructor(private readonly ctx: HandlerContext) {}

  async handle(payload: MyProcessorPayload): Promise<void> {
    const { id } = payload;

    // 1. Fetch entidad desde DynamoDB
    const entity = await this.ctx.myRepository.getById(id);
    if (!entity) throw new Error(`Entity ${id} not found`);

    // 2. Procesar con el servicio de dominio
    const result = await this.ctx.myService.process(entity);

    // 3. Actualizar estado en DynamoDB
    // 4. Guardar resultado en S3 (si aplica)
    // 5. Enviar email (si aplica)
  }
}
```

---

### 5. SQS utils (`utils/sqs.ts`)

```typescript
// External Dependencies:
import type { SQSRecord } from 'aws-lambda';

// Internal Dependencies:
import { Envelope, MyProcessorPayload } from '../types/types';

export function parseEnvelope(record: SQSRecord): Envelope<MyProcessorPayload> {
  let body: unknown;
  try {
    body = JSON.parse(record.body);
  } catch {
    throw new Error(`Invalid SQS message body: not valid JSON`);
  }

  const payload = body as MyProcessorPayload;
  if (!payload.id || !payload.messageType) {
    throw new Error('Invalid SQS message: missing id or messageType');
  }

  return { payload };
}
```

---

### 6. Dispatcher (`dispatcher.ts`)

Adaptar de `report-processor/dispatcher.ts`:

```typescript
// External Dependencies:
import { S3 } from 'aws-sdk';

// Internal Dependencies:
import { Envelope, HandlerContext, MyProcessorPayload } from './types/types';
import { MyHandler } from './handlers/myHandler';
import { MyEntityRepository } from './infrastructure/repositories/DynamoMyEntityRepository';
import { MyDomainService } from './infrastructure/services/MyDomainService';
import { IMessageHandler } from './application/interfaces/IMessageHandler';
import { CONFIG } from './config/constants';

export async function dispatch(
  envelope: Envelope,
  registry: Map<string, IMessageHandler> = buildHandlersRegistry()
): Promise<void> {
  const { messageType } = envelope.payload as MyProcessorPayload;
  const handler = registry.get(messageType);

  if (!handler) throw new Error(`Unknown message type: ${messageType}`);

  try {
    switch (messageType) {
      case 'my_message_type':
        await handler.handle(envelope.payload as MyProcessorPayload);
        break;
      default:
        throw new Error(`No handler implemented for type: ${messageType}`);
    }
  } catch (error) {
    const enriched = error instanceof Error ? error : new Error(String(error));
    enriched.message = `Error processing messageType=${messageType}: ${enriched.message}`;
    throw enriched;
  }
}

export function buildHandlersRegistry(): Map<string, IMessageHandler<unknown>> {
  const myRepository = new MyEntityRepository();
  const myService = new MyDomainService();

  const context: HandlerContext = { myRepository, myService };

  const handlers: IMessageHandler[] = [new MyHandler(context)];
  const registry = new Map<string, IMessageHandler>();
  handlers.forEach((h) => registry.set(h.type, h));
  return registry;
}
```

---

### 7. Lambda SQS handler (`handler.ts`)

Copiar exacto de `report-processor/handler.ts` — el patrón es estándar:

```typescript
// External Dependencies:
import type { SQSBatchResponse, SQSHandler, SQSRecord } from 'aws-lambda';

// Internal Dependencies:
import { parseEnvelope } from './utils/sqs';
import { dispatch, buildHandlersRegistry } from './dispatcher';
import { IMessageHandler } from './application/interfaces/IMessageHandler';

let messageHandlerRegistry: ReturnType<typeof buildHandlersRegistry>;

export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      await processSQSMessage(record);
    } catch (err) {
      console.error('[Handler] Error processing record:', record.messageId, err);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};

async function processSQSMessage(record: SQSRecord): Promise<void> {
  const envelope = parseEnvelope(record);
  const registry = await getRegistry();
  await dispatch(envelope, registry);
}

async function getRegistry(): Promise<Map<string, IMessageHandler<unknown>>> {
  if (!messageHandlerRegistry) {
    console.log('[Handler] Building message handler registry...');
    messageHandlerRegistry = buildHandlersRegistry();
  }
  return messageHandlerRegistry;
}
```

---

### 8. `serverless.yml` — Función SQS

**En `functions:`:**
```yaml
my-processor:
  handler: my-processor-name/handler.handler
  name: 'dev-fedeira-my-processor'
  timeout: 300
  memorySize: 1024
  environment:
    MY_ENTITY_TABLE: MyEntities
    AWS_BUCKET: ${env:AWS_BUCKET}
  events:
    - sqs:
        arn: !GetAtt MyQueue.Arn
        batchSize: 1
        maximumBatchingWindow: 0
        functionResponseType: ReportBatchItemFailures
        maximumConcurrency: 10
```

**En `resources: Resources:`:**
```yaml
MyQueue:
  Type: AWS::SQS::Queue
  Properties:
    QueueName: MyQueue.fifo
    FifoQueue: true
    ContentBasedDeduplication: true
    VisibilityTimeout: 300
    MessageRetentionPeriod: 1209600
    RedrivePolicy:
      deadLetterTargetArn: !GetAtt MyDeadLetterQueue.Arn
      maxReceiveCount: 5

MyDeadLetterQueue:
  Type: AWS::SQS::Queue
  Properties:
    QueueName: MyDeadLetterQueue.fifo
    FifoQueue: true
    MessageRetentionPeriod: 1209600
```

**IAM para SQS:**
```yaml
- Effect: 'Allow'
  Action: ['sqs:SendMessage','sqs:ReceiveMessage','sqs:DeleteMessage','sqs:GetQueueAttributes']
  Resource:
    - !GetAtt MyQueue.Arn
```

---

### 9. `serverless.offline.yml` — SQS local

```yaml
my-processor:
  handler: my-processor-name/handler.handler
  timeout: 300
  memorySize: 1024
  environment:
    MY_ENTITY_TABLE: MyEntities
    AWS_BUCKET: ${env:AWS_BUCKET}
  events:
    - sqs:
        arn: arn:aws:sqs:us-east-2:000000000000:MyQueue.fifo
        batchSize: 1
        maximumBatchingWindow: 0
        functionResponseType: ReportBatchItemFailures
```

> El ARN en offline usa `000000000000` como account ID (ElasticMQ local en `http://localhost:9324`).

---

### 10. Script de prueba local (`test/execute-sqs-<name>-handler.ts`)

```typescript
import type { SQSEvent, SQSRecord } from 'aws-lambda';
import { handler } from '../handler';

const mockRecord: Partial<SQSRecord> = {
  messageId: 'test-message-id-001',
  body: JSON.stringify({
    id: 'entity-uuid-here',
    messageType: 'my_message_type',
  }),
  receiptHandle: 'mock-receipt',
  attributes: {} as any,
  messageAttributes: {},
  md5OfBody: '',
  eventSource: 'aws:sqs',
  eventSourceARN: 'arn:aws:sqs:us-east-2:000000000000:MyQueue.fifo',
  awsRegion: 'us-east-2',
};

const mockEvent: SQSEvent = {
  Records: [mockRecord as SQSRecord],
};

(async () => {
  const result = await handler(mockEvent, {} as any, () => {});
  console.log('Result:', JSON.stringify(result, null, 2));
})();
```

Ejecutar:
```bash
dotenv -e .env -- ts-node my-processor-name/test/execute-sqs-<name>-handler.ts
```

---

## Variables de Entorno — Referencia Completa

### Requeridas por el sistema (ya existen en `.env`)

```env
IS_OFFLINE=true
NODE_ENV=development
JWT_SECRET=<cualquier string para local>
USER_EMAIL=<email>
USER_PASSWORD=<bcrypt hash del password>
ENCRYPTION_KEY=<64 chars hex>
ENCRYPTION_ALGORITHM=aes-256-cbc
ENCRYPTION_RANDOM_BYTES=16
AWS_REPORTS_BUCKET=dev-fedeira-personal-services-reports
AWS_REPORT_REQUESTS_QUEUE_URL=http://localhost:9324/000000000000/ReportRequestsQueue.fifo
REPORT_REQUESTS_TABLE=ReportRequests
```

### Para microservicio nuevo (agregar al `.env` y a ambos yml)

```env
MY_ENTITY_TABLE=MyEntities
MY_CUSTOM_SECRET=local-value
MY_S3_BUCKET=dev-fedeira-personal-services-bucket   # si usa S3
MY_QUEUE_URL=http://localhost:9324/000000000000/MyQueue.fifo   # si publica en SQS
```

### Obtención en AWS (producción)

| Tipo | Dónde | Comando para crear |
|------|-------|-------------------|
| Secretos | SSM Parameter Store | `aws ssm put-parameter --name /fedeira-personal-services/my-service/secret --value "xxx" --type SecureString` |
| Variables no secretas | SSM o hardcoded en yml | `aws ssm put-parameter --name ... --type String` |
| Nombres de tablas/buckets | Hardcoded o env en yml | Directo en `serverless.yml` |

---

## Comandos de Desarrollo

```bash
# Setup inicial (una sola vez)
npm install
npm run offline-db-init       # Levanta DynamoDB en Docker (puerto 8000)
npm run offline-db-migrate    # Crea tablas (lee serverless.offline.yml)
npm run insert-user           # Seed: usuario de prueba
npm run insert-accounts       # Seed: cuentas de prueba

# Desarrollo diario
npm run offline               # API local en http://localhost:3000
npm run build                 # Compilar TypeScript → ./dist

# Prueba de procesador SQS sin stack completo
dotenv -e .env -- ts-node <processor>/test/execute-sqs-<name>-handler.ts

# Deploy a AWS
npm run deploy
```

---

## Checklist Final

### Antes de hacer merge

- [ ] `tsc --noEmit` — sin errores de tipado
- [ ] El servicio/función está en ambos `serverless.yml` y `serverless.offline.yml`
- [ ] Las variables de entorno están en ambos yml y en `.env`
- [ ] Los recursos AWS (DynamoDB, SQS, S3) están declarados en `resources:` del yml
- [ ] Los permisos IAM están agregados en `iam: role: statements:`
- [ ] Si hay nueva tabla: está en `dynamodb-config.ts` para migraciones locales
- [ ] `tsconfig.json` incluye la nueva carpeta si es necesario

### Prueba local

- [ ] `npm run offline-db-migrate` — nueva tabla creada sin errores
- [ ] `npm run offline` — API levanta sin errores
- [ ] Endpoint responde correctamente (Postman o curl)
- [ ] Para SQS: script de test ejecuta sin errores

### Deploy

- [ ] `npm run deploy` exitoso
- [ ] Smoke test del endpoint en el stage `dev`
- [ ] Logs de CloudWatch sin errores críticos
