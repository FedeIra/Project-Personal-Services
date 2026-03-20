// External Dependencies:
import { SQS } from 'aws-sdk';

// Internal Dependencies:
import { ISQSRepository } from '../../application/interfaces/ISQSRepository';

export class SQSRepository implements ISQSRepository {
  constructor(
    private readonly sqs: SQS,
    private readonly queueUrl: string
  ) {}

  async sendMessage(messageBody: string): Promise<void> {
    if (!messageBody) {
      throw new Error('Message body is required for SQS.');
    }

    try {
      await this.sqs
        .sendMessage({
          QueueUrl: this.queueUrl,
          MessageBody: messageBody,
        })
        .promise();
    } catch (err) {
      console.error('[SQSRepository] Error sending message to SQS:', err);
      throw new Error(
        'Error sending message to SQS: ' + (err as Error).message
      );
    }
  }
}
