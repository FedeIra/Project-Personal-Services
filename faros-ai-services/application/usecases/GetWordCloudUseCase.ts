// Internal Dependencies:
import { IWordCloudCacheRepository } from '../interfaces/IWordCloudCacheRepository';
import { WordEntry } from '../../domain/WordCloud';

export class GetWordCloudUseCase {
  constructor(
    private readonly wordCloudCacheRepository: IWordCloudCacheRepository
  ) {}

  async execute(top: number): Promise<WordEntry[]> {
    // Reads from Lambda in-memory cache (TTL 60s) → fallback to S3.
    // Never touches DynamoDB — O(1) response time.
    return this.wordCloudCacheRepository.getTopWords(top);
  }
}
