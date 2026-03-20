# Fedeira Personal Services

A serverless backend for personal services powered by AWS Lambda, API Gateway, DynamoDB, S3, and SSM, integrating with the PPI APIs.

The system follows Clean Architecture: domain/use-cases/infrastructure layering with controllers and explicit repositories/services.

The project is deployed using the Serverless Framework in the dev stage on AWS us-east-2, leveraging a fully managed serverless stack.

Core business logic is executed in AWS Lambda functions grouped by domain (Authorization, Investment, Account), and exposed through API Gateway with CORS enabled and a custom JWT Authorizer.

Data is persisted in two DynamoDB tables (UserCredentials, Accounts), while an S3 bucket (fedeira-personal-services-bucket) is used for storage with server-side encryption (AES256).

Sensitive secrets (PPI API keys, JWT secrets, encryption keys) are securely managed in AWS Systems Manager (SSM) Parameter Store.

CloudWatch Logs provide monitoring and retention (30 days) for both Lambda and API Gateway, while SES is integrated for sending email notifications.

All resources are tagged for project/service/environment tracking, ensuring observability, maintainability, and cost management across the stack.

Services are the following:

- **Authorization Service**: Handles user authentication and authorization.
- **Investment Service**: Manages investment-related operations against PPI.
- **Account Service**: Manages user accounts.
- **Report Service**: Handles CSV upload and async report generation (liquidation reports).
- **Portfolio Service**: Portfolio comments, email, and file management (S3).
- **Faros AI Service** (Assignment): Amazon Product Descriptions Word Cloud — crawls Amazon product pages and builds a word cloud of the most significant terms.

## 🚀 Getting Started

This guide provides instructions on how to run the project both locally (for testing) and in production.

## 📌 Prerequisites

Ensure you have the following installed:

- **Node.js** v18.x or later
- **npm** (or **yarn**)
- **AWS CLI** (with configured credentials)
- **Serverless Framework** (`npm install -g serverless`)
- **Docker** Docker (only if you will run local DynamoDB)
- **TypeScript** (`npm install -D typescript`)

## 🏗 Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/FedeIra/project-personal-services.git
cd project-personal-services
npm install
```

## 🔧 Running Locally (Test Mode)

You can run the API locally using Serverless Offline and DynamoDB local. To run the project locally, follow these steps:

### 1. Start Local DynamoDB:

npm run offline-db-init
This will start DynamoDB locally using Docker.

### 2. Verify Local Database:

npm run offline-db-verify
This ensures that DynamoDB is running and accessible and that the required tables are created.

### 3. Run Migrations (if needed):

npm run offline-db-migrate
This will create required tables in the local DynamoDB instance.

For this purpose, the project uses the document dynamodb-config.ts file located in the config/ directory to define the table schemas.

### 4. Insert records into database / Seed data:

You can use scripts in the `scripts/` directory to insert initial data into your local or remote DynamoDB instance. Command examples:

To insert user:

```bash
npm run insert-user
```

To insert accounts:

```bash
npm run insert-accounts
```

### 5. Create a .env file in the root directory:

Use as guide the .env.example file to create your own .env file.

### 6. Use node.js version 20.x

The project is configured to use Node.js 20.x. Ensure you have this version installed and set as the active version in your environment.

```bash
nvm install 20
nvm use 20
```

### 7. Start the Serverless Offline API:

npm run offline
This will start a local API endpoint at http://localhost:3000.

### Test the API: Use Postman or your preferred tool to test the endpoints.

## 🚀 Deploying to AWS (Production Mode)

Ensure AWS CLI is configured:

### 1. aws configure

Set up your AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION.

### 2. Deploy to AWS:

npm run deploy
This will package and deploy your services to AWS.

Check Deployed API Gateway URL: After deployment, Serverless will output the API URL. You can verify with the AWS Console and Postman.

## 📜 Environment Variables

The project relies on AWS Systems Manager (SSM) Parameter Store for sensitive environment variables.

To check the stored variables in AWS:

aws ssm get-parameters-by-path --path /...

For local testing, you can create a .env file using the .env.example file as a guide.

## 📌 Useful Commands

Command Description:

- npm run clean → Removes the dist folder to ensure a fresh build.
- npm run build → Compiles TypeScript code into JavaScript.
- npm run typecheck → Runs TypeScript type checking without emitting files.
- npm run lint → Runs ESLint to check code style and quality.
- npm run format → Formats code using Prettier.
- npm run offline-db-init → Starts a local DynamoDB instance (via Docker).
- npm run offline-db-verify → Lists local DynamoDB tables to confirm availability.
- npm run offline-db-migrate → Runs migrations to create required DynamoDB tables locally.
- npm run offline → Starts the API locally with Serverless Offline.
- npm run nodemon → Runs the API locally with automatic reload on file changes.
- npm run package → Packages the Serverless service for deployment (without deploying).
- npm run predeploy → Runs build, typecheck, and lint before deployment.
- npm run deploy → Deploys the service to AWS.
- npm run insert-user → Runs a script to insert a test user into DynamoDB.
- npm run insert-accounts → Runs a script to insert test accounts into DynamoDB.

## Faros AI Word Cloud Service (Assignment)

### Overview

A web crawler service that generates a word cloud from Amazon product descriptions. The system receives Amazon product URLs, crawls the pages asynchronously, extracts product descriptions, and maintains a real-time word cloud of the most significant terms.

### Architecture

```
POST /wordcloud?url=X                          GET /wordcloud?top=X
        |                                              |
   [Fastify Lambda]                              [Fastify Lambda]
        |                                              |
   DynamoDB conditional write                   S3 cache (pre-computed)
   (URL deduplication)                          + Lambda in-memory cache
        |                                         (TTL 60s → O(1) response)
   SQS Standard Queue
        |
   [Processor Lambda]
        |
   1. Crawl Amazon (axios + retry + cheerio)
   2. Tokenize + filter stop words
   3. DynamoDB atomic ADD (word counts)
   4. Rebuild S3 cache (top 1000 sorted)
   5. Mark URL as PROCESSED
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/wordcloud?top=X` | Returns the top X significant terms. Fast (reads from cache). Default: 10, Max: 1000 |
| `POST` | `/wordcloud?url=X` | Submits an Amazon product URL for async processing. Returns 202 if new, 200 if duplicate |

### Key Design Decisions

1. **SQS for async processing**: POST returns 202 immediately; crawling is inherently slow (external network) and must not block HTTP responses.
2. **DynamoDB atomic increments (ADD)**: Concurrent processors safely update word counts without locks.
3. **S3 pre-computed cache**: The word corpus can be very large; GET cannot scan/sort at runtime.
4. **Lambda in-memory cache**: Avoids S3 latency on the critical GET path (warm Lambda reuse).
5. **Conditional writes for deduplication**: `attribute_not_exists(url)` prevents race conditions when duplicate URLs arrive simultaneously.
6. **Standard SQS queue (not FIFO)**: Better throughput for scaling to thousands of requests/second.

### AWS Resources (Assignment-specific)

| Resource | Name | Purpose |
|----------|------|---------|
| DynamoDB | `FarosProcessedUrls` | URL deduplication (`url` HASH key) |
| DynamoDB | `FarosWordCounts` | Word frequency (`word` HASH key, `wordCount` number) |
| SQS | `FarosWordCloudQueue` | Decouples POST from crawling |
| SQS | `FarosWordCloudDeadLetterQueue` | Failed messages after 5 retries |
| S3 | `wordcloud/cache/top-words.json` | Pre-computed sorted word cloud |

### Testing Locally

```bash
# 1. Start DynamoDB local + migrate tables
npm run offline-db-init
npm run offline-db-migrate

# 2. Start the API
npm run offline

# 3. Submit a URL
curl -X POST "http://localhost:3000/wordcloud?url=http://www.amazon.com/gp/product/B00VVOCSOU"

# 4. Get word cloud
curl "http://localhost:3000/wordcloud?top=10"

# 5. Run the simulate script
bash faros-ai-services/test/simulateRequests.sh localhost 3000 1

# 6. Test processor directly (bypass SQS)
dotenv -e .env -- ts-node faros-ai-services/test/execute-sqs-wordcloud-handler.ts
```

## 📚 Technologies Used

- 🟦 Node.js + TypeScript
- ⚙️ Serverless Framework
- 🔗 Axios (for HTTP requests)
- 🛡️ JWT (for authentication)
- 🟢 AWS Lambda
- 📦 AWS DynamoDB
- ☁️ AWS S3
- 📧 AWS SES (for notifications)
- 🔐 AWS SSM Parameter Store
- 🔗 AWS API Gateway
- 🔧 AWS Systems Manager (SSM)
- 🧪 Serverless Offline (local testing)

## 🗂 Project Structure

```
projecto-personal-services/xxxx-services/
├── application/ # Business logic (use cases and interfaces)
│ ├── interfaces/ # Abstract interfaces (repositories, services)
│ └── usecases/ # Application use cases (e.g., Login, Authorize, GetBalance)
│
├── domain/ # Pure domain entities and models
│ └── account/ # Domain models related to accounts (e.g., Balance, Token)
│
├── infrastructure/ # External layer: controllers, services, implementations
│ ├── controllers/ # Handle HTTP/event input/output and invoke use cases
│ ├── repositories/ # Implementations of repositories (e.g., PPI API, DynamoDB)
│ ├── services/ # Internal services (e.g., JWT, caching, SSM access)
│ └── factories/ # Functions that instantiate and wire dependencies
│
├── config/
├── handler.ts # Main Lambda handler
├── serverless.yml # Serverless Framework configuration
├── tsconfig.json # TypeScript compiler configuration
├── .env # Local environment variables (ignored in production)
├── package.json # Project metadata and scripts
└── common/ # Project documentation and architecture diagrams plus shared utilities
```

This structure follows the principles of Clean Architecture, ensuring separation of concerns and maintainability.
