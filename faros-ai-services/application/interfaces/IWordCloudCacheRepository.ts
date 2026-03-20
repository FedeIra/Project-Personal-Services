// Internal Dependencies:
import { WordEntry } from '../../domain/WordCloud';

export interface IWordCloudCacheRepository {
  /**
   * Gets the top words from the pre-computed S3 cache.
   * Uses Lambda in-memory cache with TTL for fast GET responses.
   */
  getTopWords(limit: number): Promise<WordEntry[]>;

  /**
   * Updates the S3 cache with the latest sorted word counts.
   * Called by the processor after updating DynamoDB word counts.
   */
  updateCache(words: WordEntry[]): Promise<void>;
}
