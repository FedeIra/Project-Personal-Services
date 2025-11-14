import { Envelope, GenerateReport } from './types/types';
import { GenerateLiquidationHandler } from './handlers/generateLiquidation';
import { ReportRequestRepository } from './infrastructure/repositories/DynamoRequestReportRepository';
import { S3Repository } from './infrastructure/repositories/S3Repository';
import { S3 } from 'aws-sdk';
import { CSVServices } from './infrastructure/services/CSVServices';

// Tipos para handlers
export interface HandlerContext {
  bucket: string;
  table: string;
  reportRequestRepository: ReportRequestRepository;
  s3Repository: S3Repository;
  CSVService: CSVServices;
  // liquidacionService: LiquidationService;
}

export interface IMsgHandler<T = unknown> {
  readonly type: string;
  handle(payload: T): Promise<void>;
}

class UnknownMessageTypeError extends Error {
  constructor(type: string) {
    super(`Unknown message type: ${type}`);
    this.name = 'UnknownMessageTypeError';
  }
}

export function buildRegistry() {
  const { AWS_REPORTS_BUCKET } = process.env;
  if (!AWS_REPORTS_BUCKET) throw new Error('AWS_REPORTS_BUCKET requerido');

  const reportRequestRepository = new ReportRequestRepository();
  const s3 = new S3();
  const s3Repository = new S3Repository(s3, AWS_REPORTS_BUCKET);
  const csvService = new CSVServices();

  const context = {
    reportRequestRepository: reportRequestRepository,
    s3Repository: s3Repository,
    CSVService: csvService,
    // liquidacionService,
  };

  // Registro de handlers
  const handlers: IMsgHandler[] = [new GenerateLiquidationHandler(context)];

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
  const reportType = (envelope.payload as GenerateReport).reportType;
  const handler = registry.get(reportType);

  if (!handler) {
    throw new UnknownMessageTypeError(reportType);
  }

  try {
    console.info(`[Dispatcher] Processing message of type: ${reportType}`);

    switch (reportType) {
      case 'termination_liquidation':
        await handler.handle(envelope.payload as GenerateReport);
        break;
      default:
        throw new UnknownMessageTypeError(reportType);
    }

    console.info(
      `[Dispatcher] Successfully processed message of type: ${reportType}`
    );
  } catch (error) {
    const enrichedError =
      error instanceof Error ? error : new Error(String(error));
    enrichedError.message = `Error processing message type=${reportType}: ${enrichedError.message}`;
    console.error('[Dispatcher] Error:', enrichedError);
    throw enrichedError;
  }
}
