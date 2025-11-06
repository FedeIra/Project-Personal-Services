import type { SQSRecord } from 'aws-lambda';
import { Envelope } from '../types/types';

// tolerante a JSON doblemente serializado o body==id
export function parseEnvelope(record: SQSRecord): Envelope {
  const raw = record.body;
  try {
    const first = JSON.parse(raw);
    if (typeof first === 'string') return JSON.parse(first);
    if (isEnvelope(first)) return first;
    // fallback: body era un objeto sin type o un id suelto
    if (typeof first === 'object' && first && 'id' in first) {
      return { type: 'GenerateLiquidacion', payload: first }; // default razonable
    }
    return { type: 'GenerateLiquidacion', payload: { id: String(first) } };
  } catch {
    // body no era JSON => asumimos body = id
    return { type: 'GenerateLiquidacion', payload: { id: raw } };
  }
}

function isEnvelope(x: any): x is Envelope {
  return (
    x && typeof x === 'object' && typeof x.type === 'string' && 'payload' in x
  );
}
