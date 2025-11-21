// External Dependencies:
import type { SQSBatchResponse, SQSHandler, SQSRecord } from 'aws-lambda';

// Internal Dependencies:
import { parseEnvelope } from './utils/sqs';
import { dispatch, buildHandlersRegistry } from './dispatcher';
import { IMessageHandler } from './application/interfaces/IMessageHandler';

let messageHandlerRegistry: ReturnType<typeof buildHandlersRegistry>;

// Lambda SQS Handler:
export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      await processSQSMessage(record);
    } catch (err) {
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};

// Process a single SQS record:
async function processSQSMessage(record: SQSRecord): Promise<void> {
  const envelope = parseEnvelope(record);

  const registry = await getMessageHandlerRegistry();

  await dispatch(envelope, registry);
}

// Get or build the handler registry:
async function getMessageHandlerRegistry(): Promise<
  Map<string, IMessageHandler<unknown>>
> {
  if (!messageHandlerRegistry) {
    console.log('[Handler] Building message handler registry...');
    messageHandlerRegistry = buildHandlersRegistry();
  }
  return messageHandlerRegistry;
}
