import type { SQSBatchResponse, SQSHandler, SQSRecord } from 'aws-lambda';
import { parseEnvelope } from './utils/sqs';
import { dispatch, buildRegistry } from './dispatcher';

// Singleton para el registry
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
    console.info('[SQS Handler] Procesando mensaje:', {
      messageId: record.messageId,
      type: envelope.type,
    });
    const registry = await getRegistry();

    console.info('[SQS Handler] Mensaje procesado exitosamente:', {
      messageId: record.messageId,
      type: envelope.type,
    });

    await dispatch(envelope, registry);

    console.info('[SQS Handler] Mensaje procesado exitosamente:', {
      messageId: record.messageId,
      type: envelope.type,
    });
  } catch (error) {
    console.error('[SQS Handler] Error al procesar el registro:', {
      messageId: record.messageId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error; // Re-throw para que el handler principal lo maneje
  }
}

export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const failures: { itemIdentifier: string }[] = [];

  // Procesar registros secuencialmente para evitar sobrecarga
  for (const record of event.Records) {
    try {
      await processRecord(record);
    } catch (err) {
      failures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures: failures };
};
