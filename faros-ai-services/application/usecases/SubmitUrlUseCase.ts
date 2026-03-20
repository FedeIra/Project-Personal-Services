// Internal Dependencies:
import { IProcessedUrlRepository } from '../interfaces/IProcessedUrlRepository';
import { ISQSRepository } from '../interfaces/ISQSRepository';

export class SubmitUrlUseCase {
  constructor(
    private readonly processedUrlRepository: IProcessedUrlRepository,
    private readonly sqsRepository: ISQSRepository
  ) {}

  async execute(url: string): Promise<{ submitted: boolean; message: string }> {
    // 1. Attempt conditional write (atomic deduplication)
    // If the URL already exists in DynamoDB, the conditional write fails
    // and markUrlAsProcessing returns false — preventing duplicate processing.
    const isNewUrl: boolean =
      await this.processedUrlRepository.markUrlAsProcessing(url);

    if (!isNewUrl) {
      return {
        submitted: false,
        message: 'URL already submitted or processed',
      };
    }

    // 2. Enqueue URL for async processing via SQS
    const sqsMessage = JSON.stringify({
      url,
      messageType: 'word_cloud_url',
    });

    await this.sqsRepository.sendMessage(sqsMessage);

    return {
      submitted: true,
      message: 'URL submitted for processing',
    };
  }
}
