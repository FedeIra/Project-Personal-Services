// External Dependencies:
import { S3 } from 'aws-sdk';

// Internal Dependencies:
import { IWordCloudCacheRepository } from '../../application/interfaces/IWordCloudCacheRepository';
import { WordEntry } from '../../domain/WordCloud';
import { CONFIG } from '../../config/constants';

/**
 * S3-backed word cloud cache with Lambda in-memory TTL caching.
 *
 * Design rationale:
 * - S3 stores the pre-computed sorted word cloud (updated by the processor)
 * - Lambda in-memory cache avoids S3 reads on every GET request
 * - Cache TTL (60s) balances freshness vs latency
 * - GET /wordcloud?top=X reads from memory → O(1) response time
 */
export class S3WordCloudCacheRepository implements IWordCloudCacheRepository {
  private cachedData: WordEntry[] | null = null;
  private lastFetchTime: number = 0;

  constructor(
    private readonly s3: S3,
    private readonly bucketName: string,
    private readonly cacheKey: string
  ) {}

  async getTopWords(limit: number): Promise<WordEntry[]> {
    const now = Date.now();

    // Check Lambda in-memory cache (warm Lambda containers reuse this)
    if (
      this.cachedData &&
      now - this.lastFetchTime < CONFIG.FAROS_WORDCLOUD_CACHE_TTL_MS
    ) {
      return this.cachedData.slice(0, limit);
    }

    // Cache miss — fetch from S3
    try {
      const result = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: this.cacheKey,
        })
        .promise();

      const words: WordEntry[] = JSON.parse(result.Body!.toString());
      this.cachedData = words;
      this.lastFetchTime = now;
      return words.slice(0, limit);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        (error as { code?: string }).code === 'NoSuchKey'
      ) {
        // Cache file doesn't exist yet — no URLs have been processed
        return [];
      }
      console.error(
        '[S3WordCloudCacheRepository] Error reading cache from S3:',
        error
      );
      throw error;
    }
  }

  async updateCache(words: WordEntry[]): Promise<void> {
    try {
      await this.s3
        .putObject({
          Bucket: this.bucketName,
          Key: this.cacheKey,
          Body: JSON.stringify(words),
          ContentType: 'application/json',
        })
        .promise();

      // Update in-memory cache on the processor Lambda
      // (Note: HTTP Lambda has its own in-memory cache with TTL expiry)
      this.cachedData = words;
      this.lastFetchTime = Date.now();
    } catch (error) {
      console.error(
        '[S3WordCloudCacheRepository] Error updating cache in S3:',
        error
      );
      throw error;
    }
  }
}
