// External Dependencies:
import { S3 } from 'aws-sdk';

// Internal Dependencies:
import {
  Envelope,
  HandlerContext,
  ReportGenerationRequest,
} from './types/types';
import { GenerateLiquidationHandler } from './handlers/generateLiquidation';
import { ReportRequestRepository } from './infrastructure/repositories/DynamoRequestReportRepository';
import { S3Repository } from './infrastructure/repositories/S3Repository';
import { CSVServices } from './infrastructure/services/CSVServices';
import { IMessageHandler } from './application/interfaces/IMessageHandler';
import { CONFIG } from './config/constants';
import { LiquidationServices } from './infrastructure/services/LiquidationServices';

// Dispatcher Function to route messages to appropriate handlers:
export async function dispatch(
  envelope: Envelope,
  registry: Map<string, IMessageHandler> = buildHandlersRegistry()
): Promise<void> {
  const { reportType } = envelope.payload as ReportGenerationRequest;
  const handler: IMessageHandler<unknown> | undefined =
    registry.get(reportType);

  if (!handler) {
    throw new Error(`Unknown message type: ${reportType}`);
  }

  try {
    // Dispatch to the appropriate handler based on report type:
    switch (reportType) {
      case 'termination_liquidation':
        await handler.handle(envelope.payload as ReportGenerationRequest);
        break;
      default:
        throw new Error(`No handler implemented for type: ${reportType}`);
    }
  } catch (error) {
    const enrichedError =
      error instanceof Error ? error : new Error(String(error));
    enrichedError.message = `Error processing message type=${reportType}: ${enrichedError.message}`;
    throw enrichedError;
  }
}

// Registry Builder:
export function buildHandlersRegistry(): Map<string, IMessageHandler<unknown>> {
  // Initialize repositories and services
  const reportRequestRepository = new ReportRequestRepository();
  const s3 = new S3();
  const s3Repository = new S3Repository(s3, CONFIG.AWS_REPORTS_BUCKET);
  const csvService = new CSVServices();
  const liquidationService = new LiquidationServices();

  // Create handler context with dependencies:
  const handlerContext: HandlerContext = {
    reportRequestRepository: reportRequestRepository,
    s3Repository: s3Repository,
    CSVService: csvService,
    LiquidationService: liquidationService,
  };

  // Instantiate handlers:
  const handlers: IMessageHandler[] = [
    new GenerateLiquidationHandler(handlerContext),
  ];

  // Build handlers map by report type
  const registry = new Map<string, IMessageHandler>();
  handlers.forEach((handler) => {
    registry.set(handler.type, handler);
  });

  return registry;
}
