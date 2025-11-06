import { Envelope, GenerateLiquidacionPayload } from './types/types';
import { GenerateLiquidacionHandler } from './handlers/generateLiquidation';

// Interface común de handlers:
interface IMsgHandler<T> {
  type: string;
  handle(payload: T): Promise<void>;
}

// Construimos el registry con dependencias compartidas:
export function buildRegistry() {
  const BUCKET = process.env.AWS_REPORTS_BUCKET!;
  const TABLE = process.env.REPORT_REQUESTS_TABLE!;

  const generate = new GenerateLiquidacionHandler({
    bucket: BUCKET,
    table: TABLE,
  });

  const map = new Map<string, IMsgHandler<any>>();
  map.set(generate.type, generate);
  return map;
}

export async function dispatch(
  env: Envelope,
  registry = buildRegistry()
): Promise<void> {
  const handler = registry.get(env.type);
  if (!handler) throw new Error(`Unknown message type: ${env.type}`);
  // Type narrowing “manual”:
  switch (env.type) {
    case 'GenerateLiquidacion':
      return handler.handle(env.payload as GenerateLiquidacionPayload);
    default:
      throw new Error(`Unhandled type: ${env.type}`);
  }
}
