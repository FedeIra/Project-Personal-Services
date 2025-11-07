import { Envelope, GenerateLiquidacionPayload } from './types/types';
import { GenerateLiquidacionHandler } from './handlers/generateLiquidation';

// Tipos para handlers
export interface HandlerContext {
  bucket: string;
  table: string;
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
  // Verificación simple de variables de entorno requeridas
  if (!process.env.AWS_REPORTS_BUCKET || !process.env.REPORT_REQUESTS_TABLE) {
    throw new Error(
      'Missing required environment variables: AWS_REPORTS_BUCKET and/or REPORT_REQUESTS_TABLE'
    );
  }

  const context: HandlerContext = {
    bucket: process.env.AWS_REPORTS_BUCKET,
    table: process.env.REPORT_REQUESTS_TABLE,
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
