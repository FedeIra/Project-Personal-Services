import type { SQSBatchResponse, SQSHandler, SQSRecord } from 'aws-lambda';
import { parseEnvelope } from './utils/sqs';
import { dispatch, buildRegistry } from './dispatcher';

let registryInstance: ReturnType<typeof buildRegistry>;

async function getRegistry() {
  if (!registryInstance) {
    registryInstance = buildRegistry();
  }
  return registryInstance;
}

async function processRecord(record: SQSRecord): Promise<void> {
  try {
    const envelope = parseEnvelope(record);

    const registry = await getRegistry();

    await dispatch(envelope, registry);
  } catch (error) {
    console.error('[SQS Handler] Error al procesar el registro:', {
      messageId: record.messageId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const failures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      await processRecord(record);
    } catch (err) {
      failures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures: failures };
};
