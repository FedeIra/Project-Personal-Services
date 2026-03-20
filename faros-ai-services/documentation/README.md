# Faros AI Assignment — Amazon Product Descriptions Word Cloud

## Objetivo

Servicio web que genera un word cloud a partir de descripciones de productos de Amazon. Recibe URLs de productos vía REST endpoint, crawlea las páginas, extrae las descripciones y mantiene un word cloud con las palabras más significativas.

---

## Endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| `GET`  | `/wordcloud?top=X` | Retorna los top X términos significativos. Rápido (lee cache pre-computado). Default: 10, Max: 1000 |
| `POST` | `/wordcloud?url=X` | Envía una URL de Amazon para procesamiento async. Retorna 202 si es nueva, 200 si está duplicada |

---

## Arquitectura

```
POST /wordcloud?url=X                            GET /wordcloud?top=X
        │                                                │
   [Fastify Lambda]                                [Fastify Lambda]
        │                                                │
   DynamoDB conditional write                     S3 cache (pre-computado)
   (deduplicación de URLs)                        + Lambda in-memory cache
        │                                           (TTL 60s → respuesta O(1))
   SQS Standard Queue
        │
   [Processor Lambda]
        │
   1. Crawl Amazon (axios + retry + cheerio)
   2. Tokenizar + filtrar stop words
   3. DynamoDB atomic ADD (conteo de palabras)
   4. Reconstruir S3 cache (top 1000 ordenados)
   5. Marcar URL como PROCESSED
```

### Flujo detallado del POST

1. Controller valida que la URL sea de Amazon
2. SubmitUrlUseCase ejecuta un **conditional write atómico** en DynamoDB (`attribute_not_exists(url)`)
   - Si la URL ya existe → retorna 200 "URL already submitted" (deduplicación)
   - Si es nueva → la inserta con status `IN_PROGRESS`
3. Encola mensaje en SQS con `{ url, messageType: "word_cloud_url" }`
4. Retorna 202 Accepted inmediatamente (no espera el crawling)

### Flujo detallado del Processor (SQS Lambda)

1. Recibe mensaje de SQS con la URL
2. Verifica si la URL ya fue procesada (guard para at-least-once delivery de SQS)
3. Crawlea la página de Amazon con axios (retry exponencial, 3 intentos, 15s timeout)
4. Parsea HTML con cheerio, extrayendo el `#productDescription` y selectores alternativos
5. Tokeniza el texto: lowercase → remove punctuation → split → filter stop words → filter < 3 chars
6. Incrementa atómicamente los conteos en DynamoDB con `ADD` expression (sin locks, sin race conditions)
7. Escanea DynamoDB, ordena por count DESC, toma top 1000 → actualiza S3 cache
8. Marca URL como `PROCESSED` en DynamoDB

### Flujo detallado del GET

1. Lee el word cloud pre-computado desde Lambda in-memory cache (TTL 60s)
2. Si cache expiró → lee de S3 y re-cachea en memoria
3. Retorna los primeros X elementos del array pre-ordenado → respuesta O(1)

---

## Decisiones de Diseño

### 1. SQS para procesamiento async

**Por qué:** El crawling es inherentemente lento (red externa, 5-15s) y no debe bloquear la respuesta HTTP. API Gateway tiene un timeout de 29s. Con SQS, el POST retorna 202 inmediatamente.

### 2. Standard Queue (no FIFO)

**Por qué:** El assignment requiere soportar "several orders of magnitudes" más carga. Standard Queues tienen throughput casi ilimitado vs FIFO (300/s). La deduplicación de URLs se maneja en DynamoDB, no en SQS.

### 3. DynamoDB atomic increments (ADD expression)

**Por qué:** Múltiples processors concurrentes pueden actualizar los mismos conteos de palabras sin locks ni race conditions. Cada `UpdateItem` con `ADD` es atómico a nivel de ítem.

### 4. Conditional write para deduplicación

**Por qué:** Si 5 requests llegan simultáneamente con la misma URL, el `PutItem` con `attribute_not_exists(url)` garantiza que solo uno tenga éxito. DynamoDB rechaza los demás con `ConditionalCheckFailedException`. Elimina la race condition del patrón check-then-insert.

### 5. S3 pre-computed cache

**Por qué:** El corpus de palabras puede ser muy grande. No es viable escanear y ordenar todas las palabras en cada GET request. El cache se recalcula una vez por URL procesada (en el processor, async).

### 6. Lambda in-memory cache (TTL 60s)

**Por qué:** Evita latencia de S3 en el path crítico del GET. Los Lambda containers "warm" reutilizan la variable en memoria entre invocaciones. Tradeoff: máximo 60s de stale data, aceptable para un word cloud.

### 7. Stop words hardcodeadas

**Por qué:** Simple y efectivo para inglés. Lista de ~120 palabras comunes (a, the, is, are, etc.) que no aportan al word cloud. Extensible a S3 si se necesita.

---

## Infraestructura AWS (específica del assignment)

| Recurso | Nombre | Propósito |
|---------|--------|-----------|
| Lambda HTTP | `dev-fedeira-faros-ai-services` | Endpoints GET/POST /wordcloud (Fastify) |
| Lambda SQS | `dev-fedeira-faros-ai-processor` | Procesamiento async de URLs |
| DynamoDB | `FarosProcessedUrls` | Deduplicación de URLs (`url` HASH key, `status`, timestamps) |
| DynamoDB | `FarosWordCounts` | Conteo de frecuencia de palabras (`word` HASH key, `wordCount` number) |
| SQS | `FarosWordCloudQueue` | Cola standard para desacoplar POST del crawling |
| SQS | `FarosWordCloudDeadLetterQueue` | Mensajes fallidos después de 5 reintentos |
| S3 | `wordcloud/cache/top-words.json` | Cache pre-computado del word cloud ordenado |

---

## Estructura de Archivos

```
faros-ai-services/
├── app.ts                                          ← Fastify + DI + rutas GET/POST
├── lambda.ts                                       ← Lambda HTTP wrapper (cold start optimization)
├── processor-handler.ts                            ← Lambda SQS wrapper (batch failure reporting)
├── dispatcher.ts                                   ← Message router + handler registry builder
├── config/
│   └── constants.ts                                ← Variables de entorno tipadas
├── domain/
│   ├── WordCloud.ts                                ← WordEntry, ProcessedUrl, UrlStatus
│   └── StopWords.ts                                ← Lista de stop words en inglés
├── types/
│   └── types.ts                                    ← Envelope, ProcessorHandlerContext
├── application/
│   ├── interfaces/
│   │   ├── IProcessedUrlRepository.ts              ← Contrato deduplicación URLs
│   │   ├── IWordCountRepository.ts                 ← Contrato incrementos atómicos
│   │   ├── IWordCloudCacheRepository.ts            ← Contrato cache S3 + in-memory
│   │   ├── ISQSRepository.ts                       ← Contrato envío a SQS
│   │   ├── IScraperService.ts                      ← Contrato crawling + parsing
│   │   ├── IWordTokenizerService.ts                ← Contrato tokenización
│   │   └── IMessageHandler.ts                      ← Contrato handler de mensajes
│   └── usecases/
│       ├── SubmitUrlUseCase.ts                     ← Conditional write + SQS enqueue
│       └── GetWordCloudUseCase.ts                  ← Lee cache pre-computado
├── handlers/
│   └── processWordCloudUrl.ts                      ← Handler: crawl → tokenize → increment → cache
├── infrastructure/
│   ├── controllers/
│   │   ├── SubmitUrlController.ts                  ← Validación URL Amazon + POST handler
│   │   └── GetWordCloudController.ts               ← GET handler con validación de params
│   ├── repositories/
│   │   ├── DynamoProcessedUrlRepository.ts         ← Conditional write deduplication
│   │   ├── DynamoWordCountRepository.ts            ← Atomic ADD + scan/sort
│   │   ├── S3WordCloudCacheRepository.ts           ← S3 cache + Lambda in-memory TTL
│   │   └── SQSRepository.ts                        ← Standard queue message sender
│   └── services/
│       ├── AmazonScraperService.ts                 ← axios (retry exponencial) + cheerio
│       └── WordTokenizerService.ts                 ← Tokenizer + stop word filter
├── utils/
│   └── sqs.ts                                      ← parseEnvelope helper con validación
├── test/
│   ├── execute-sqs-wordcloud-handler.ts            ← Script para probar processor localmente
│   └── simulateRequests.sh                         ← Simulador de requests con curl
└── documentation/
    ├── README.md                                   ← Este archivo
    ├── assignment.md                               ← Enunciado del assignment
    └── Amazon_Product_Descriptions_Word_Cloud.pdf  ← PDF del assignment
```

---

## Archivos Modificados (fuera de faros-ai-services/)

Todos los cambios están marcados con el comentario `[Faros AI Assignment]` para fácil identificación y eventual limpieza.

| Archivo | Cambios |
|---------|---------|
| `serverless.yml` | +2 Lambda functions, +2 DynamoDB tables, +2 SQS queues, env vars, IAM permissions |
| `serverless.offline.yml` | +2 Lambda functions, +2 DynamoDB tables, +1 SQS queue, env vars |
| `dynamodb-config.ts` | +2 table definitions (FarosProcessedUrls, FarosWordCounts) |
| `tsconfig.json` | +`faros-ai-services/**/*` en include array |
| `package.json` | +`cheerio` dependency (HTML parsing) |
| `.env` | +4 variables: FAROS_PROCESSED_URLS_TABLE, FAROS_WORD_COUNTS_TABLE, FAROS_WORDCLOUD_QUEUE_URL, FAROS_WORDCLOUD_CACHE_BUCKET |
| `.prettierignore` | +exclusión de `faros-ai-services/documentation/*.md` |
| `common/docs/README.md` | +documentación del servicio Faros AI |

---

## Dependencias Nuevas

| Paquete | Versión | Uso |
|---------|---------|-----|
| `cheerio` | ^1.0.0 | Parsing HTML de páginas de Amazon (jQuery-like API para Node.js) |

Dependencias reutilizadas del proyecto existente:

- `axios` + `axios-retry` — HTTP client con retry exponencial
- `aws-sdk` — DynamoDB, S3, SQS
- `fastify` + `@fastify/aws-lambda` — HTTP framework + Lambda wrapper

---

## Testing Local

```bash
# 1. Iniciar DynamoDB local + migrar tablas
npm run offline-db-init
npm run offline-db-migrate

# 2. Levantar API
npm run offline

# 3. Enviar una URL
curl -X POST "http://localhost:3000/wordcloud?url=http://www.amazon.com/gp/product/B00VVOCSOU"

# 4. Consultar word cloud
curl "http://localhost:3000/wordcloud?top=10"

# 5. Ejecutar simulador de requests
bash faros-ai-services/test/simulateRequests.sh localhost 3000 1

# 6. Testear processor directamente (sin pasar por SQS)
dotenv -e .env -- ts-node faros-ai-services/test/execute-sqs-wordcloud-handler.ts
```

---

## Escalabilidad

| Componente | Capacidad | Justificación |
|------------|-----------|---------------|
| POST handler | O(1) por request | Solo DynamoDB conditional write + SQS enqueue |
| SQS Standard Queue | Throughput casi ilimitado | Standard queue vs FIFO (300/s limit) |
| Processor Lambda | Escala automáticamente | Lambda concurrency controlada por maximumConcurrency: 10 |
| DynamoDB word counts | Sin límite práctico | Atomic ADD, PAY_PER_REQUEST billing |
| GET handler | O(1) por request | Lambda in-memory cache → S3 fallback |

Para escalar a 10,000+ req/seg: solo aumentar `maximumConcurrency` del processor y el Lambda reserved concurrency del HTTP handler.
