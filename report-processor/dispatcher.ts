import { S3 } from 'aws-sdk';
import { Envelope, GenerateLiquidacionPayload } from './types/types';
import { GenerateLiquidacionHandler } from './handlers/generateLiquidation';
import { ReportRequestRepository } from './infrastructure/repositories/DynamoRequestReportRepository';
import { S3Repository } from './infrastructure/repositories/S3Repository';
// import { LiquidationService } from './services/LiquidationService';

// Tipos para handlers
export interface HandlerContext {
  bucket: string;
  table: string;
  reportRequestRepository: ReportRequestRepository;
  s3Repository: S3Repository;
  // liquidacionService: LiquidationService;
}

export interface IMsgHandler<T = unknown> {
  readonly type: string;
  handle(payload: T): Promise<void>;
}

// Error personalizado para tipos desconocidos
class UnknownMessageTypeError extends Error {
  constructor(type: string) {
    super(`Unknown message type: ${type}`);
    this.name = 'UnknownMessageTypeError';
  }
}

// Registry con manejo de dependencias simplificado
export function buildRegistry() {
  const { AWS_REPORTS_BUCKET } = process.env;
  if (!AWS_REPORTS_BUCKET) throw new Error('AWS_REPORTS_BUCKET requerido');

  // NO construyas DocumentClient acá
  const reportRepo = new ReportRequestRepository(); // usa su singleton interno
  const s3 = new S3();
  const s3Repo = new S3Repository(s3, AWS_REPORTS_BUCKET);
  // const liquidacionService = new LiquidacionService();

  const context = {
    bucket: AWS_REPORTS_BUCKET,
    // table: ya no es necesario si el repo lee de process.env internamente
    reportRepo,
    s3Repo,
    // liquidacionService,
  };

  // Registro de handlers
  const handlers: IMsgHandler[] = [new GenerateLiquidacionHandler(context)];

  // Construcción del mapa de handlers
  const registry = new Map<string, IMsgHandler>();
  handlers.forEach((handler) => {
    registry.set(handler.type, handler);
    console.info(`[Dispatcher] Registered handler for type: ${handler.type}`);
  });

  return registry;
}

export async function dispatch(
  envelope: Envelope,
  registry: Map<string, IMsgHandler> = buildRegistry()
): Promise<void> {
  const handler = registry.get(envelope.type);

  if (!handler) {
    throw new UnknownMessageTypeError(envelope.type);
  }

  try {
    console.info(`[Dispatcher] Processing message of type: ${envelope.type}`);

    switch (envelope.type) {
      case 'GenerateLiquidacion':
        await handler.handle(envelope.payload as GenerateLiquidacionPayload);
        break;
      default:
        throw new UnknownMessageTypeError(envelope.type);
    }

    console.info(
      `[Dispatcher] Successfully processed message of type: ${envelope.type}`
    );
  } catch (error) {
    // Enriquecer el error con contexto
    const enrichedError =
      error instanceof Error ? error : new Error(String(error));
    enrichedError.message = `Error processing message type=${envelope.type}: ${enrichedError.message}`;
    console.error('[Dispatcher] Error:', enrichedError);
    throw enrichedError;
  }
}
