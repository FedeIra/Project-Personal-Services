// External Dependencies:
import type {
  SQSEvent,
  SQSRecord,
  Context,
  SQSBatchResponse,
} from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

// Internal Dependencies:
import { handler } from '../handler';
import { ReportGenerationRequest } from '../types/types';

async function executeHandler(): Promise<void> {
  // Example SQS message:
  const messageBody: ReportGenerationRequest = {
    id: '4378b7ac-cb27-42ca-8660-993db3328022',
    reportType: 'termination_liquidation',
  };

  // SQS record simulation:
  const sqsRecord: SQSRecord = {
    messageId: uuidv4(),
    receiptHandle: 'dummy-receipt-handle',
    body: JSON.stringify(messageBody),
    attributes: {
      ApproximateReceiveCount: '1',
      SentTimestamp: Date.now().toString(),
      SenderId: 'SIMULATOR',
      ApproximateFirstReceiveTimestamp: Date.now().toString(),
    },
    messageAttributes: {},
    md5OfBody: 'dummy-md5',
    eventSource: 'aws:sqs',
    eventSourceARN:
      'arn:aws:sqs:us-east-2:000000000000:ReportRequestsQueue.fifo',
    awsRegion: 'us-east-2',
  };

  // SQS event
  const sqsEvent: SQSEvent = {
    Records: [sqsRecord],
  };

  // Test context simulation:
  const context: Context = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'report-processor-local',
    functionVersion: 'LOCAL',
    invokedFunctionArn: 'local',
    memoryLimitInMB: '128',
    awsRequestId: uuidv4(),
    logGroupName: 'local',
    logStreamName: 'local',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  try {
    const result: void | SQSBatchResponse = await handler(
      sqsEvent,
      context,
      () => {}
    );
    console.log('Finished executing handler. Result:', result);
  } catch (error) {
    console.error('Error executing handler:', error);
    process.exit(1);
  }
}

executeHandler();
