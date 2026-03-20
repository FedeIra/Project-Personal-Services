// Internal Dependencies:
import { WordEntry } from '../../domain/WordCloud';

export interface IWordCountRepository {
  /**
   * Atomically increments word counts in DynamoDB using ADD expression.
   * Supports concurrent updates without race conditions.
   */
  incrementWordCounts(wordCounts: Map<string, number>): Promise<void>;

  /**
   * Scans all word counts from DynamoDB, sorted by count descending.
   * Used to rebuild the S3 cache after processing.
   */
  getAllWordCountsSorted(limit: number): Promise<WordEntry[]>;
}
