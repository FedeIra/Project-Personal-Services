# /new-services — Guía para Crear un Microservicio Nuevo

Cuando el usuario ejecute este comando, seguí este paso a paso para guiarlos en la creación de un microservicio nuevo. Preguntá primero qué tipo de microservicio quieren crear:

**Tipo A — HTTP (Fastify):** recibe requests HTTP via API Gateway. Modelo: `report-services/`.
**Tipo B — SQS/Async:** procesa mensajes de una cola SQS. Modelo: `report-processor/`.

---

## Tipo A: Microservicio HTTP (Fastify)

### Paso 1 — Crear estructura de carpetas

```
<service-name>/
├── app.ts
├── lambda.ts
├── domain/
│   └── <Entity>.ts
├── application/
│   ├── interfaces/
│   │   └── I<Entity>Repository.ts
│   └── usecases/
│       └── <Action><Entity>UseCase.ts
└── infrastructure/
    ├── controllers/
    │   └── <Action><Entity>Controller.ts
    └── repositories/
        └── Dynamo<Entity>Repository.ts
```

### Paso 2 — Dominio (`domain/<Entity>.ts`)

```typescript
export interface MyEntity {
  id: string;
  // ... campos
  createdAt: string;
}

export enum MyEntityStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}
```

### Paso 3 — Interfaz de repositorio (`application/interfaces/IMyEntityRepository.ts`)

```typescript
import { MyEntity } from '../../domain/MyEntity';

export interface IMyEntityRepository {
  createMyEntity(entity: MyEntity): Promise<string>;
  getMyEntityById(id: string): Promise<MyEntity | null>;
}
```

### Paso 4 — Use Case (`application/usecases/CreateMyEntityUseCase.ts`)

```typescript
// External Dependencies:
import { v4 as uuidv4 } from 'uuid';

// Internal Dependencies:
import { IMyEntityRepository } from '../interfaces/IMyEntityRepository';
import { MyEntity } from '../../domain/MyEntity';

export class CreateMyEntityUseCase {
  constructor(private readonly myEntityRepository: IMyEntityRepository) {}

  async execute(input: { field: string }): Promise<string> {
    const entity: MyEntity = {
      id: uuidv4(),
      field: input.field,
      createdAt: new Date().toISOString(),
    };
    return this.myEntityRepository.createMyEntity(entity);
  }
}
```

### Paso 5 — Repository (`infrastructure/repositories/DynamoMyEntityRepository.ts`)

```typescript
// External Dependencies:
import DynamoDB from 'aws-sdk/clients/dynamodb';

// Internal Dependencies:
import { IMyEntityRepository } from '../../application/interfaces/IMyEntityRepository';
import { MyEntity } from '../../domain/MyEntity';

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
    await this.client.put({ TableName: this.tableName, Item: entity }).promise();
    return entity.id;
  }

  async getMyEntityById(id: string): Promise<MyEntity | null> {
    const result = await this.client.get({
      TableName: this.tableName,
      Key: { id },
    }).promise();
    return (result.Item as MyEntity) ?? null;
  }
}
```

### Paso 6 — Controller (`infrastructure/controllers/CreateMyEntityController.ts`)

```typescript
// External Dependencies:
import { FastifyRequest, FastifyReply } from 'fastify';

// Internal Dependencies:
import { CreateMyEntityUseCase } from '../../application/usecases/CreateMyEntityUseCase';
import { buildResponse, ErrorHandler } from '../../../common/utils/ResponseBuilder';

export class CreateMyEntityController {
  constructor(private readonly useCase: CreateMyEntityUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<FastifyReply> {
    const { param } = request.params as { param: string };
    const body = request.body as { field: string };

    // Validar
    if (!body.field) {
      return reply.status(400).send(ErrorHandler.handle(new Error('field is required')));
    }

    const id = await this.useCase.execute({ field: body.field });
    return reply.status(201).send(buildResponse('success', 201, { id }));
  }
}
```

### Paso 7 — `app.ts` (DI + rutas)

```typescript
// External Dependencies:
import Fastify, { FastifyInstance } from 'fastify';

// Internal Dependencies:
import { MyEntityRepository } from './infrastructure/repositories/DynamoMyEntityRepository';
import { CreateMyEntityUseCase } from './application/usecases/CreateMyEntityUseCase';
import { CreateMyEntityController } from './infrastructure/controllers/CreateMyEntityController';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // DI manual
  const myEntityRepository = new MyEntityRepository();
  const createMyEntityUseCase = new CreateMyEntityUseCase(myEntityRepository);
  const createMyEntityController = new CreateMyEntityController(createMyEntityUseCase);

  // Rutas
  app.post('/my-resource/:param', async (request, reply) =>
    createMyEntityController.handle(request, reply)
  );

  return app;
}
```

### Paso 8 — `lambda.ts`

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

### Paso 9 — Agregar a `serverless.yml`

En `functions:`:
```yaml
my-service:
  handler: my-service-name/lambda.handler
  name: 'dev-fedeira-my-service-name'
  timeout: 29
  memorySize: 1024
  events:
    - http:
        path: my-resource/{param}
        method: post
        cors: true
        authorizer:
          name: auth-service-authorizer
          type: TOKEN
```

En `resources: Resources:` (si hay nueva tabla DynamoDB):
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

En `provider: environment:`:
```yaml
MY_ENTITY_TABLE: MyEntities
MY_CUSTOM_VAR: ${env:MY_CUSTOM_VAR, ssm:/fedeira-personal-services/my-service/myVar}
```

Agregar IAM para la tabla nueva en `iam: role: statements:`:
```yaml
- Effect: 'Allow'
  Action: ['dynamodb:Query','dynamodb:Scan','dynamodb:GetItem','dynamodb:PutItem','dynamodb:UpdateItem','dynamodb:DeleteItem']
  Resource:
    - !Sub 'arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/MyEntities'
```

### Paso 10 — Agregar a `serverless.offline.yml`

En `functions:`:
```yaml
my-service:
  handler: my-service-name/lambda.handler
  events:
    - http:
        path: my-resource/{param}
        method: post
        cors: true
        authorizer:
          name: auth-service-authorizer
          type: TOKEN
```

En `provider: environment:`:
```yaml
MY_ENTITY_TABLE: MyEntities
MY_CUSTOM_VAR: ${env:MY_CUSTOM_VAR}
```

En `resources: Resources:` (igual que en prod):
```yaml
MyEntityTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: MyEntities
    # ... mismo schema
```

### Paso 11 — Variables de entorno en `.env`

```env
MY_CUSTOM_VAR=valor-local
MY_ENTITY_TABLE=MyEntities
```

### Paso 12 — `tsconfig.json`

Verificar que la carpeta del servicio está incluida. Si no:
```json
"include": ["my-service-name/**/*", ...]
```

### Paso 13 — Checklist final

- [ ] `tsc --noEmit` sin errores
- [ ] `npm run offline-db-migrate` crea la nueva tabla
- [ ] `npm run offline` levanta el endpoint
- [ ] Probar con Postman (importar colección `common/docs/`)
- [ ] `npm run deploy` para desplegar

---

## Tipo B: Microservicio SQS/Async

### Paso 1 — Estructura de carpetas

```
<processor-name>/
├── handler.ts
├── dispatcher.ts
├── types/types.ts
├── config/constants.ts
├── application/
│   ├── interfaces/
│   │   ├── IMessageHandler.ts
│   │   └── I<Entity>Repository.ts
│   └── domain/<Entity>.ts
├── handlers/<action><Entity>.ts
├── infrastructure/
│   ├── repositories/Dynamo<Entity>Repository.ts
│   └── services/<Domain>Services.ts
└── test/execute-sqs-<name>-handler.ts
```

### Paso 2 — Tipos (`types/types.ts`)

```typescript
export type Envelope<T = unknown> = {
  version?: string;
  payload: T;
};

export type MyMessagePayload = {
  id: string;
  messageType: string;
};

export interface HandlerContext {
  myRepository: IMyRepository;
  myService: IMyService;
}
```

### Paso 3 — Config (`config/constants.ts`)

```typescript
export const CONFIG = {
  IS_OFFLINE: process.env.IS_OFFLINE === 'true',
  MY_TABLE: process.env.MY_TABLE!,
  AWS_BUCKET: process.env.AWS_BUCKET!,
};
```

### Paso 4 — IMessageHandler (`application/interfaces/IMessageHandler.ts`)

```typescript
export interface IMessageHandler<T = unknown> {
  readonly type: string;
  handle(payload: T): Promise<void>;
}
```

### Paso 5 — Handler de mensaje (`handlers/myHandler.ts`)

```typescript
// External Dependencies:
// (ninguna o las necesarias)

// Internal Dependencies:
import { IMessageHandler } from '../application/interfaces/IMessageHandler';
import { MyMessagePayload, HandlerContext } from '../types/types';

export class MyHandler implements IMessageHandler<MyMessagePayload> {
  readonly type = 'my_message_type';

  constructor(private readonly ctx: HandlerContext) {}

  async handle(payload: MyMessagePayload): Promise<void> {
    const { id } = payload;
    // 1. Fetch desde DynamoDB
    // 2. Procesar
    // 3. Actualizar estado
    // 4. Guardar resultado
  }
}
```

### Paso 6 — Dispatcher (`dispatcher.ts`)

Copiar el patrón de `report-processor/dispatcher.ts` y adaptar:
- `buildHandlersRegistry()`: instanciar repos/services, crear HandlerContext, registrar handlers
- `dispatch()`: switch por tipo de mensaje

### Paso 7 — Handler Lambda (`handler.ts`)

Copiar `report-processor/handler.ts` exacto — el patrón no cambia.

### Paso 8 — SQS utils (`utils/sqs.ts`)

```typescript
import type { SQSRecord } from 'aws-lambda';
import { Envelope, MyMessagePayload } from '../types/types';

export function parseEnvelope(record: SQSRecord): Envelope<MyMessagePayload> {
  const body = JSON.parse(record.body);
  if (!body.messageType || !body.id) {
    throw new Error('Invalid SQS message: missing required fields');
  }
  return { payload: body };
}
```

### Paso 9 — Agregar a `serverless.yml`

```yaml
my-processor:
  handler: my-processor-name/handler.handler
  name: 'dev-fedeira-my-processor'
  timeout: 300
  memorySize: 1024
  environment:
    MY_TABLE: MyEntities
  events:
    - sqs:
        arn: !GetAtt MyQueue.Arn
        batchSize: 1
        maximumBatchingWindow: 0
        functionResponseType: ReportBatchItemFailures
        maximumConcurrency: 10
```

En `resources: Resources:`:
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

### Paso 10 — Script de prueba local (`test/execute-sqs-<name>-handler.ts`)

```typescript
import { handler } from '../handler';

const mockEvent = {
  Records: [{
    messageId: 'test-id-001',
    body: JSON.stringify({ id: 'entity-uuid', messageType: 'my_message_type' }),
    // ...otros campos requeridos por SQSRecord
  }],
};

handler(mockEvent as any, {} as any, () => {});
```

Ejecutar:
```bash
dotenv -e .env -- ts-node my-processor-name/test/execute-sqs-<name>-handler.ts
```

---

## Preguntas clave antes de crear el microservicio

1. ¿HTTP (Fastify) o SQS/async?
2. ¿Qué entidades de dominio maneja?
3. ¿Qué tablas DynamoDB necesita (nuevas o existentes)?
4. ¿Necesita S3, SQS, SES?
5. ¿Requiere autenticación JWT (authorizer)?
6. ¿Qué variables de entorno nuevas necesita?
