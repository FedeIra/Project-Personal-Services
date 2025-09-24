import { SQS } from 'aws-sdk';

export class SQSRepository {
  constructor(
    private readonly sqs: SQS,
    private readonly queueUrl: string
  ) {}

  async sendMessageToFifoQueue(
    messageBody: string,
    email: string
  ): Promise<void> {
    if (!messageBody || !email) {
      throw new Error('Message body and email are required for SQS FIFO.');
    }

    try {
      await this.sqs
        .sendMessage({
          QueueUrl: this.queueUrl,
          MessageBody: messageBody,
          MessageGroupId: email,
          MessageDeduplicationId: `${email}-${Date.now()}`,
        })
        .promise();
    } catch (err) {
      throw new Error(
        'Error sending message to SQS: ' + (err as Error).message
      );
    }
  }
}
