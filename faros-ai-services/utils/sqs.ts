// External Dependencies:
import type { SQSRecord } from 'aws-lambda';

// Internal Dependencies:
import { Envelope, WordCloudProcessingRequest } from '../types/types';

export function parseEnvelope(
  record: SQSRecord
): Envelope<WordCloudProcessingRequest> {
  const raw: string = record.body;

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isValidWordCloudRequest(parsed)) {
      throw new Error(
        `Invalid message format. Expected object with 'url' and 'messageType'. ` +
          `Received: ${JSON.stringify(parsed)}`
      );
    }

    return {
      payload: parsed,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in SQS message body: ${raw}`);
    }
    throw error;
  }
}

function isValidWordCloudRequest(
  obj: unknown
): obj is WordCloudProcessingRequest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'url' in obj &&
    'messageType' in obj &&
    typeof (obj as WordCloudProcessingRequest).url === 'string' &&
    typeof (obj as WordCloudProcessingRequest).messageType === 'string'
  );
}
