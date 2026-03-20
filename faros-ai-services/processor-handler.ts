// External Dependencies:
import type { SQSBatchResponse, SQSHandler, SQSRecord } from 'aws-lambda';

// Internal Dependencies:
import { parseEnvelope } from './utils/sqs';
import { dispatch, buildHandlersRegistry } from './dispatcher';
import { IMessageHandler } from './application/interfaces/IMessageHandler';

// Singleton handler registry (reused across warm Lambda invocations):
let messageHandlerRegistry: ReturnType<typeof buildHandlersRegistry>;

export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      await processSQSMessage(record);
    } catch (err) {
      console.error(
        `[processor-handler] Failed to process message ${record.messageId}:`,
        err
      );
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};

async function processSQSMessage(record: SQSRecord): Promise<void> {
  const envelope = parseEnvelope(record);
  const registry = await getMessageHandlerRegistry();
  await dispatch(envelope, registry);
}

async function getMessageHandlerRegistry(): Promise<
  Map<string, IMessageHandler<unknown>>
> {
  if (!messageHandlerRegistry) {
    console.log('[processor-handler] Building message handler registry...');
    messageHandlerRegistry = buildHandlersRegistry();
  }
  return messageHandlerRegistry;
}
