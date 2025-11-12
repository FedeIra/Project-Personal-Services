import type { SQSRecord } from 'aws-lambda';
import { Envelope } from '../types/types';

export function parseEnvelope(record: SQSRecord): Envelope {
  const raw = record.body;
  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed &&
      'reportType' in parsed &&
      'id' in parsed
    ) {
      return {
        payload: parsed,
      };
    }
    throw new Error(
      `Invalid message format. Expected object with 'reportType' and 'id' fields. Received: ${JSON.stringify(parsed)}`
    );
  } catch (parseError) {
    throw new Error(
      `Failed to parse SQS message body. Raw body: ${raw}. Error: ${parseError instanceof Error ? parseError.message : String(parseError)}`
    );
  }
}
