import type { SQSBatchResponse, SQSHandler } from 'aws-lambda';
import { parseEnvelope } from './utils/sqs';
import { dispatch, buildRegistry } from './dispatcher';

const registry = buildRegistry();

export const handler: SQSHandler = async (event): Promise<SQSBatchResponse> => {
  const failures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const envelope = parseEnvelope(record);
      await dispatch(envelope, registry);
      console.log(
        `Processed messageId=${record.messageId} type=${envelope.type}`
      );
    } catch (err) {
      console.error('Failed record', record.messageId, err);
      failures.push({ itemIdentifier: record.messageId });
    }
  }

  // con batchSize=1 en prod, igual devolvemos partial por robustez
  return { batchItemFailures: failures };
};
