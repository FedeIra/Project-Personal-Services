/**
 * Local test script for the Faros AI Word Cloud SQS processor handler.
 * Simulates an SQS event with a word cloud processing request.
 *
 * Usage:
 *   dotenv -e .env -- ts-node faros-ai-services/test/execute-sqs-wordcloud-handler.ts
 */

// External Dependencies:
import type { SQSEvent } from 'aws-lambda';

// Internal Dependencies:
import { handler } from '../processor-handler';

const testUrl = 'https://www.amazon.com/gp/product/B00SMBFZNG';

const mockSQSEvent: SQSEvent = {
  Records: [
    {
      messageId: 'test-message-001',
      receiptHandle: 'test-receipt-handle',
      body: JSON.stringify({
        url: testUrl,
        messageType: 'word_cloud_url',
      }),
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: Date.now().toString(),
        SenderId: 'test-sender',
        ApproximateFirstReceiveTimestamp: Date.now().toString(),
      },
      messageAttributes: {},
      md5OfBody: 'test-md5',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-2:000000000000:FarosWordCloudQueue',
      awsRegion: 'us-east-2',
    },
  ],
};

async function main(): Promise<void> {
  console.log('=== Faros AI Word Cloud Processor - Local Test ===');
  console.log(`Processing URL: ${testUrl}`);
  console.log('');

  try {
    const result = await handler(mockSQSEvent, {} as never, () => {});
    console.log('');
    console.log('=== Result ===');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('=== Error ===');
    console.error(error);
    process.exit(1);
  }
}

main();
