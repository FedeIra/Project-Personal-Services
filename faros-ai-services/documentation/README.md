# Faros AI Assignment — Amazon Product Descriptions Word Cloud

## Objective

Web service that generates a word cloud from Amazon product descriptions. Receives product URLs via REST endpoint, crawls the pages, extracts descriptions, and maintains a word cloud with the most significant words.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/wordcloud?top=X` | Returns the top X significant terms. Fast (reads pre-computed cache). Default: 10, Max: 1000 |
| `POST` | `/wordcloud?url=X` | Submits an Amazon URL for async processing. Returns 202 if new, 200 if duplicate |

---

## Architecture

```
POST /wordcloud?url=X                            GET /wordcloud?top=X
        │                                                │
   [Fastify Lambda]                                [Fastify Lambda]
        │                                                │
   DynamoDB conditional write                     S3 cache (pre-computed)
   (URL deduplication)                            + Lambda in-memory cache
        │                                           (TTL 60s → O(1) response)
   SQS Standard Queue
        │
   [Processor Lambda]
        │
   1. Crawl Amazon (axios + retry + cheerio)
   2. Tokenize + filter stop words
   3. DynamoDB atomic ADD (word count)
   4. Rebuild S3 cache (top 1000 sorted)
   5. Mark URL as PROCESSED
```

### Detailed POST Flow

1. Controller validates that the URL belongs to Amazon
2. SubmitUrlUseCase executes an **atomic conditional write** in DynamoDB (`attribute_not_exists(url)`)
   - If the URL already exists → returns 200 "URL already submitted" (deduplication)
   - If new → inserts it with status `IN_PROGRESS`
3. Enqueues a message in SQS with `{ url, messageType: "word_cloud_url" }`
4. Returns 202 Accepted immediately (does not wait for crawling)

### Detailed Processor Flow (SQS Lambda)

1. Receives SQS message with the URL
2. Checks if the URL was already processed (guard for at-least-once SQS delivery)
3. Crawls the Amazon page with axios (exponential retry, 3 attempts, 15s timeout)
4. Parses HTML with cheerio, extracting `#productDescription` and alternative selectors
5. Tokenizes the text: lowercase → remove punctuation → split → filter stop words → filter < 3 chars
6. Atomically increments word counts in DynamoDB using `ADD` expression (lock-free, no race conditions)
7. Scans DynamoDB, sorts by count DESC, takes top 1000 → updates S3 cache
8. Marks URL as `PROCESSED` in DynamoDB

### Detailed GET Flow

1. Reads the pre-computed word cloud from Lambda in-memory cache (TTL 60s)
2. If cache expired → reads from S3 and re-caches in memory
3. Returns the first X elements from the pre-sorted array → O(1) response

---

## Design Decisions

### 1. SQS for async processing

**Why:** Crawling is inherently slow (external network, 5–15s) and should not block the HTTP response. API Gateway has a 29s timeout. With SQS, the POST returns 202 immediately.

### 2. Standard Queue (not FIFO)

**Why:** The assignment requires supporting "several orders of magnitude" more load. Standard Queues have near-unlimited throughput vs FIFO (300/s). URL deduplication is handled in DynamoDB, not SQS.

### 3. DynamoDB atomic increments (ADD expression)

**Why:** Multiple concurrent processors can update the same word counts without locks or race conditions. Each `UpdateItem` with `ADD` is atomic at the item level.

### 4. Conditional write for deduplication

**Why:** If 5 simultaneous requests arrive with the same URL, the `PutItem` with `attribute_not_exists(url)` guarantees only one succeeds. DynamoDB rejects the rest with `ConditionalCheckFailedException`. Eliminates the race condition from the check-then-insert pattern.

### 5. S3 pre-computed cache

**Why:** The word corpus can be very large. Scanning and sorting all words on every GET request is not viable. The cache is recalculated once per processed URL (in the processor, async).

### 6. Lambda in-memory cache (TTL 60s)

**Why:** Avoids S3 latency on the critical GET path. Warm Lambda containers reuse the in-memory variable across invocations. Trade-off: up to 60s of stale data — acceptable for a word cloud.

### 7. Hardcoded stop words

**Why:** Simple and effective for English. List of ~120 common words (a, the, is, are, etc.) that don't contribute to the word cloud. Extensible to S3 if needed.

---

## AWS Infrastructure (assignment-specific)

| Resource | Name | Purpose |
|----------|------|----------|
| Lambda HTTP | `dev-fedeira-faros-ai-services` | GET/POST /wordcloud endpoints (Fastify) |
| Lambda SQS | `dev-fedeira-faros-ai-processor` | Async URL processing |
| DynamoDB | `FarosProcessedUrls` | URL deduplication (`url` HASH key, `status`, timestamps) |
| DynamoDB | `FarosWordCounts` | Word frequency counts (`word` HASH key, `wordCount` number) |
| SQS | `FarosWordCloudQueue` | Standard queue to decouple POST from crawling |
| SQS | `FarosWordCloudDeadLetterQueue` | Failed messages after 5 retries |
| S3 | `wordcloud/cache/top-words.json` | Pre-computed sorted word cloud cache |

---

## File Structure

```
faros-ai-services/
├── app.ts                                          ← Fastify + DI + GET/POST routes
├── lambda.ts                                       ← HTTP Lambda wrapper (cold start optimization)
├── processor-handler.ts                            ← SQS Lambda wrapper (batch failure reporting)
├── dispatcher.ts                                   ← Message router + handler registry builder
├── config/
│   └── constants.ts                                ← Typed environment variables
├── domain/
│   ├── WordCloud.ts                                ← WordEntry, ProcessedUrl, UrlStatus
│   └── StopWords.ts                                ← English stop words list
├── types/
│   └── types.ts                                    ← Envelope, ProcessorHandlerContext
├── application/
│   ├── interfaces/
│   │   ├── IProcessedUrlRepository.ts              ← URL deduplication contract
│   │   ├── IWordCountRepository.ts                 ← Atomic increment contract
│   │   ├── IWordCloudCacheRepository.ts            ← S3 + in-memory cache contract
│   │   ├── ISQSRepository.ts                       ← SQS enqueue contract
│   │   ├── IScraperService.ts                      ← Crawling + parsing contract
│   │   ├── IWordTokenizerService.ts                ← Tokenization contract
│   │   └── IMessageHandler.ts                      ← Message handler contract
│   └── usecases/
│       ├── SubmitUrlUseCase.ts                     ← Conditional write + SQS enqueue
│       └── GetWordCloudUseCase.ts                  ← Reads pre-computed cache
├── handlers/
│   └── processWordCloudUrl.ts                      ← Handler: crawl → tokenize → increment → cache
├── infrastructure/
│   ├── controllers/
│   │   ├── SubmitUrlController.ts                  ← Amazon URL validation + POST handler
│   │   └── GetWordCloudController.ts               ← GET handler with param validation
│   ├── repositories/
│   │   ├── DynamoProcessedUrlRepository.ts         ← Conditional write deduplication
│   │   ├── DynamoWordCountRepository.ts            ← Atomic ADD + scan/sort
│   │   ├── S3WordCloudCacheRepository.ts           ← S3 cache + Lambda in-memory TTL
│   │   └── SQSRepository.ts                        ← Standard queue message sender
│   └── services/
│       ├── AmazonScraperService.ts                 ← axios (exponential retry) + cheerio
│       └── WordTokenizerService.ts                 ← Tokenizer + stop word filter
├── utils/
│   └── sqs.ts                                      ← parseEnvelope helper with validation
├── test/
│   ├── execute-sqs-wordcloud-handler.ts            ← Script to test processor locally
│   └── simulateRequests.sh                         ← Request simulator using curl
└── documentation/
    ├── README.md                                   ← This file
    ├── assignment.md                               ← Assignment description
    └── Amazon_Product_Descriptions_Word_Cloud.pdf  ← Assignment PDF
```

---

## Modified Files (outside faros-ai-services/)

All changes are marked with the `[Faros AI Assignment]` comment for easy identification and eventual cleanup.

| File | Changes |
|------|---------|
| `serverless.yml` | +2 Lambda functions, +2 DynamoDB tables, +2 SQS queues, env vars, IAM permissions |
| `serverless.offline.yml` | +2 Lambda functions, +2 DynamoDB tables, +1 SQS queue, env vars |
| `dynamodb-config.ts` | +2 table definitions (FarosProcessedUrls, FarosWordCounts) |
| `tsconfig.json` | +`faros-ai-services/**/*` in include array |
| `package.json` | +`cheerio` dependency (HTML parsing) |
| `.env` | +4 variables: FAROS_PROCESSED_URLS_TABLE, FAROS_WORD_COUNTS_TABLE, FAROS_WORDCLOUD_QUEUE_URL, FAROS_WORDCLOUD_CACHE_BUCKET |
| `.prettierignore` | +exclusion of `faros-ai-services/documentation/*.md` |
| `common/docs/README.md` | +Faros AI service documentation |

---

## New Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `cheerio` | ^1.0.0 | HTML parsing of Amazon pages (jQuery-like API for Node.js) |

Reused dependencies from the existing project:

- `axios` + `axios-retry` — HTTP client with exponential retry
- `aws-sdk` — DynamoDB, S3, SQS
- `fastify` + `@fastify/aws-lambda` — HTTP framework + Lambda wrapper

---

## Local Testing

### Prerequisites

```bash
# 1. Start local DynamoDB (Docker)
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local \
  -jar DynamoDBLocal.jar -inMemory -sharedDb

# 2. Start ElasticMQ for local SQS (Docker)
docker run -d -p 9324:9324 -p 9325:9325 --name elasticmq softwaremill/elasticmq-native

# 3. Create local SQS queue
aws sqs create-queue --queue-name FarosWordCloudQueue \
  --endpoint-url http://localhost:9324 --region us-east-2

# 4. Create local DynamoDB tables
npm run offline-db-migrate

# 5. Insert test user
npm run insert-user

# 6. Start API
npm run offline
```

---

### Get JWT token

```bash
curl -s -X POST "http://localhost:3000/dev/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"fedeirar@gmail.com","password":"YOUR_PASSWORD"}'
# Response: { "token": "eyJ..." }
```

---

### POST /wordcloud — Submit a URL for processing

```bash
# New URL → responds 202 Accepted
curl -X POST "http://localhost:3000/dev/wordcloud?url=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Repeated URL → responds 200 (deduplication)
curl -X POST "http://localhost:3000/dev/wordcloud?url=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### GET /wordcloud — Query the word cloud

```bash
# Top 10 words (default)
curl "http://localhost:3000/dev/wordcloud" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Top 50 words
curl "http://localhost:3000/dev/wordcloud?top=50" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Top 1000 words (maximum)
curl "http://localhost:3000/dev/wordcloud?top=1000" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Test the SQS Processor directly (without HTTP or SQS)

The processor is not triggered automatically in local mode (serverless-offline-sqs does not auto-consume from ElasticMQ). To test it directly:

```bash
# Default URL (B00SMBFZNG)
npx dotenv -e .env -- ts-node faros-ai-services/test/execute-sqs-wordcloud-handler.ts

# Specific URL
npx dotenv -e .env -- ts-node faros-ai-services/test/execute-sqs-wordcloud-handler.ts \
  https://www.amazon.com/gp/product/B00SMBESTI
```

If the URL was already processed, delete it from DynamoDB first:

```bash
aws dynamodb delete-item \
  --table-name FarosProcessedUrls \
  --key '{"url": {"S": "https://www.amazon.com/gp/product/B00SMBESTI"}}' \
  --endpoint-url http://localhost:8000 --region localhost
```

---

### Run the assignment simulation script

The script sends 120 POSTs with 9 unique URLs (with repetitions), simulating the assignment's load pattern.

```bash
# In Git Bash (Windows) or a terminal with bash available:

# Option A: with credentials (the script auto-logs in)
bash faros-ai-services/test/simulateRequests.sh \
  http://localhost 3000/dev/wordcloud url 1 fedeirar@gmail.com YOUR_PASSWORD

# Option B: with pre-obtained token (skips login)
export TOKEN="eyJ..."
bash faros-ai-services/test/simulateRequests.sh \
  http://localhost 3000/dev/wordcloud url 1
```

**Expected responses:**
- `202` — New URL, enqueued in SQS for processing
- `200` — Duplicate URL, ignored (deduplication)

---

### Clean local data (to re-test from scratch)

```bash
# Delete Faros tables and recreate them
aws dynamodb delete-table --table-name FarosProcessedUrls \
  --endpoint-url http://localhost:8000 --region localhost
aws dynamodb delete-table --table-name FarosWordCounts \
  --endpoint-url http://localhost:8000 --region localhost
npm run offline-db-migrate
```

---

## Testing on AWS

```bash
# Deploy
npm run deploy

# Login
curl -s -X POST "https://bk7xpquf2k.execute-api.us-east-2.amazonaws.com/dev/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"fedeirar@gmail.com","password":"YOUR_PASSWORD"}'

# POST (submit URL)
curl -X POST "https://bk7xpquf2k.execute-api.us-east-2.amazonaws.com/dev/wordcloud?url=https%3A%2F%2Fwww.amazon.com%2Fgp%2Fproduct%2FB00SMBESTI" \
  -H "Authorization: Bearer YOUR_TOKEN"

# GET (query word cloud)
curl "https://bk7xpquf2k.execute-api.us-east-2.amazonaws.com/dev/wordcloud?top=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Full assignment simulation script on AWS
export TOKEN="eyJ..."
bash faros-ai-services/test/simulateRequests.sh \
  https://bk7xpquf2k.execute-api.us-east-2.amazonaws.com dev/wordcloud url 1
```

In AWS the SQS processor triggers automatically — there is no need to run the local test script.

---

## Scalability

| Component | Capacity | Justification |
|-----------|----------|--------------|
| POST handler | O(1) per request | Only DynamoDB conditional write + SQS enqueue |
| SQS Standard Queue | Near-unlimited throughput | Standard queue vs FIFO (300/s limit) |
| Processor Lambda | Auto-scales | Lambda concurrency controlled by maximumConcurrency: 10 |
| DynamoDB word counts | No practical limit | Atomic ADD, PAY_PER_REQUEST billing |
| GET handler | O(1) per request | Lambda in-memory cache → S3 fallback |

To scale to 10,000+ req/sec: simply increase the processor's `maximumConcurrency` and the HTTP handler's Lambda reserved concurrency.
