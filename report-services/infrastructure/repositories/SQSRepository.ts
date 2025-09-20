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
    await this.sqs
      .sendMessage({
        QueueUrl: this.queueUrl,
        MessageBody: messageBody,
        MessageGroupId: email, // Agrupador FIFO
        MessageDeduplicationId: `${email}-${Date.now()}`, // Un identificador único
      })
      .promise();
  }
}
