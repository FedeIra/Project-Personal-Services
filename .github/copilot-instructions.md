# Arquitectura del Sistema: Project-Personal-Services

**Org:** fedeira-personal-services
**Stack:** Node.js 20.x + TypeScript 5.7.3 + Serverless Framework 4.1.0
**Deploy:** AWS Lambda (us-east-2, stage: dev)
**HTTP Framework:** Fastify (solo report-services)
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

### 5. report-processor (en desarrollo activo)
Lambda disparado por SQS. Procesa liquidaciones laborales de forma asíncrona.
- **Arquitectura interna:** Message Dispatcher con registro de handlers por `reportType`
- **Handler activo:** `GenerateLiquidationHandler` para `termination_liquidation`
- **Flujo completo:** DynamoDB (fetch) → S3 (leer CSV) → parsear → calcular → DynamoDB (status) → S3 (guardar resultado) → SES (email)
- **CSVServices:** papaparse, separador `;`, encoding latin1, headers en español → EmploymentData
- **LiquidationServices:** calcula indemnizaciones laborales (ver detalle abajo)
- **SQS:** batch size 1, max concurrency 10, visibility timeout 300s, max receive count 5 (luego DLQ)

### 6. common
Utilidades compartidas: `ResponseBuilder`, `ErrorHandler`, `axiosConfiguration` con retries.

---

## Dominio de Liquidación Laboral (report-processor)

**Modelos clave:**
- `EmploymentData`: grossSalary, bestMonthlySalary, startDate, endDate, vacationBalance, location, registrationStatus
- `SeniorityAndTerminationData`: años/meses/días de antigüedad, desglose del mes de egreso

**Cálculos implementados en LiquidationServices:**
- Salario base diario
- Días trabajados en el mes de egreso
- SAC proporcional
- Vacaciones proporcionales + SAC sobre vacaciones
- Indemnización por antigüedad + SAC sobre antigüedad
- Preaviso (30 días de salario base) + SAC sobre preaviso
- Integración (días pendientes) + SAC sobre integración

**Reglas de negocio:**
- Buenos Aires tiene cálculo de SAC diferente al resto de provincias
- Variaciones según trabajador registrado vs. no registrado

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
  └─► POST /reports/{email} ────────────► report-services
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

## Infraestructura AWS

| Servicio | Uso |
|----------|-----|
| Lambda | 6 funciones (auth, login, accounts, investment, report-upload, report-processor) |
| API Gateway | REST API unificada con Lambda authorizer, CORS habilitado |
| DynamoDB | 3 tablas: UserCredentials, Accounts, ReportRequests |
| S3 | `dev-fedeira-personal-services-bucket` — CSVs entrada + reportes generados |
| SQS FIFO | Cola + DLQ (`ReportRequestsDeadLetterQueue.fifo`), retención 14 días |
| SES | Envío del reporte generado por email |
| SSM Parameter Store | Secretos en producción (JWT secret, PPI keys, crypto key) |
| CloudWatch + X-Ray | Logs 30 días + tracing habilitado |

---

## Estado del Desarrollo (al 2026-03-17)

**Rama activa:** `Task/liquidation-report-process`

### Completado
- Parser CSV (papaparse, latin1, separador `;`)
- Cálculos de liquidación: días trabajados, SAC proporcional, vacaciones, antigüedad, preaviso, integración
- Message Dispatcher con handler registry extensible
- Scaffolding completo del pipeline

### Pendiente
- Persistir resultado de liquidación en DynamoDB (actualizar status)
- Guardar reporte generado en S3 (`reports/response/{date}/{email}/{id}.json`)
- Envío del reporte por SES
- Remover mock data y conectar con CSV real
- Tests de los cálculos de liquidación

---

## Desarrollo Local

Para correr el proyecto localmente seguir los pasos del README completo en `common/docs/README.md`.

### Prerequisitos
- Node.js 20.x (`nvm use 20`)
- Docker (para DynamoDB local)
- AWS CLI configurado
- Serverless Framework (`npm install -g serverless`)

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env en la raíz (usar env.example como guía)

# 3. Iniciar DynamoDB local (requiere Docker)
npm run offline-db-init

# 4. Verificar que DynamoDB está corriendo
npm run offline-db-verify

# 5. Correr migraciones (crear tablas)
npm run offline-db-migrate

# 6. Insertar datos de prueba
npm run insert-user
npm run insert-accounts

# 7. Levantar la API localmente (http://localhost:3000)
npm run offline
```

### Variables de entorno requeridas para modo offline
Además de las variables de credenciales, asegurarse de tener:
- `IS_OFFLINE=true`
- `AWS_REPORTS_BUCKET=<nombre del bucket>`
- `AWS_REPORT_REQUESTS_QUEUE_URL=<url de la cola SQS>`
- `REPORT_REQUESTS_TABLE=ReportRequests`

### Ejecutar report-processor localmente (sin levantar todo el stack)
Usar el script de prueba que simula un evento SQS:
```bash
dotenv -e .env -- ts-node report-processor/test/execute-sqs-report-processor-handler.ts
```

---

## Documentación del Proyecto

Los siguientes archivos de referencia se encuentran en `common/docs/`:

| Archivo | Descripción |
|---------|-------------|
| `README.md` | Guía completa de instalación, ejecución local y despliegue |
| `architecture.png` | Diagrama visual de la arquitectura del sistema |
| `architecture.drawio` | Diagrama editable de la arquitectura (draw.io) |
| `Project Personal Services API.postman_collection.json` | Colección Postman con todos los endpoints del sistema |
