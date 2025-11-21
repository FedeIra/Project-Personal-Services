// External Dependencies:
import type { SQSRecord } from 'aws-lambda';

// Internal Dependencies:
import { Envelope, ReportGenerationRequest } from '../types/types';

// Parse and validate SQS message body into a typed envelope:
export function parseEnvelope(
  record: SQSRecord
): Envelope<ReportGenerationRequest> {
  const raw: string = record.body;

  try {
    const parsed: unknown = JSON.parse(raw);

    // Validate required fields:
    if (!isValidGenerateReport(parsed)) {
      throw new Error(
        `Invalid message format. Expected object with 'reportType' and 'id'. ` +
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

// Validations for ReportGenerationRequest type:
function isValidGenerateReport(obj: unknown): obj is ReportGenerationRequest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'reportType' in obj &&
    'id' in obj &&
    typeof (obj as ReportGenerationRequest).reportType === 'string' &&
    typeof (obj as ReportGenerationRequest).id === 'string'
  );
}
