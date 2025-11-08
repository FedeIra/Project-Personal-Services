import { handler } from '../handler';
import type { SQSEvent, SQSRecord, Context } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

async function executeHandler() {
  // Configura variables de entorno necesarias
  process.env.AWS_REPORTS_BUCKET = 'dev-fedeira-personal-services-bucket';
  process.env.REPORT_REQUESTS_TABLE = 'ReportRequests';

  // Crea un mensaje SQS de ejemplo
  const messageBody = {
    type: 'generateLiquidation',
    payload: {
      id: '17374dd9-38e1-4e50-bb96-5189bd90f3f0',
      email: 'fedeirar@gmail.com',
    },
  };

  // Crea un registro SQS simulado
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

  // Crea el evento SQS completo
  const sqsEvent: SQSEvent = {
    Records: [sqsRecord],
  };

  // Contexto simulado de Lambda
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
    console.log(
      'Ejecutando handler con mensaje:',
      JSON.stringify(messageBody, null, 2)
    );
    const result = await handler(sqsEvent, context, () => {});
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Error ejecutando handler:', error);
    process.exit(1);
  }
}

executeHandler();
