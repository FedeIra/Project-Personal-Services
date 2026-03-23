// External Dependencies:
import { DynamoDB } from 'aws-sdk';

// Internal Dependencies:
import { IWordCountRepository } from '../../application/interfaces/IWordCountRepository';
import { WordEntry } from '../../domain/WordCloud';
import { CONFIG } from '../../config/constants';

const isOffline: boolean = CONFIG.IS_OFFLINE;

let dynamoDb: DynamoDB.DocumentClient;

if (isOffline) {
  dynamoDb = new DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
  });
} else {
  dynamoDb = new DynamoDB.DocumentClient();
}

export class DynamoWordCountRepository implements IWordCountRepository {
  /**
   * Atomically increments word counts using DynamoDB ADD expression.
   * Multiple concurrent processors can safely update the same words
   * without locks or race conditions.
   *
   * Batches updates in parallel groups for performance.
   */
  async incrementWordCounts(wordCounts: Map<string, number>): Promise<void> {
    const entries = Array.from(wordCounts.entries());
    const batchSize = CONFIG.FAROS_WORD_COUNT_BATCH_SIZE;

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);

      await Promise.all(
        batch.map(([word, count]) =>
          dynamoDb
            .update({
              TableName: CONFIG.FAROS_WORD_COUNTS_TABLE,
              Key: { word },
              UpdateExpression: 'ADD wordCount :count',
              ExpressionAttributeValues: { ':count': count },
            })
            .promise()
        )
      );
    }
  }

  /**
   * Scans all word counts and returns them sorted by count descending.
   * Used to rebuild the S3 cache after processing a URL.
   *
   * For a word cloud with bounded vocabulary (product descriptions),
   * a full scan is practical. For millions of unique words, consider
   * using Redis Sorted Sets instead.
   */
  async getAllWordCountsSorted(limit: number): Promise<WordEntry[]> {
    const allItems: WordEntry[] = [];
    let lastEvaluatedKey: DynamoDB.DocumentClient.Key | undefined;

    do {
      const result = await dynamoDb
        .scan({
          TableName: CONFIG.FAROS_WORD_COUNTS_TABLE,
          ExclusiveStartKey: lastEvaluatedKey,
          FilterExpression: 'wordCount >= :minCount',
          ExpressionAttributeValues: { ':minCount': 3 },
        })
        .promise();

      if (result.Items) {
        for (const item of result.Items) {
          allItems.push({
            word: item.word as string,
            count: (item.wordCount as number) || 0,
          });
        }
      }

      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    // Sort by count descending and take top N
    allItems.sort((a, b) => b.count - a.count);
    return allItems.slice(0, limit);
  }
}
