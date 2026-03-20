// External Dependencies:
import { DynamoDB } from 'aws-sdk';

// Internal Dependencies:
import { IProcessedUrlRepository } from '../../application/interfaces/IProcessedUrlRepository';
import { ProcessedUrl, UrlStatus } from '../../domain/WordCloud';
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

export class DynamoProcessedUrlRepository implements IProcessedUrlRepository {
  /**
   * Atomic conditional write: only succeeds if the URL does NOT already exist.
   * This prevents race conditions when multiple concurrent POST requests
   * arrive with the same URL — DynamoDB guarantees only one PutItem succeeds.
   */
  async markUrlAsProcessing(url: string): Promise<boolean> {
    const now = new Date().toISOString();

    try {
      await dynamoDb
        .put({
          TableName: CONFIG.FAROS_PROCESSED_URLS_TABLE,
          Item: {
            url,
            status: UrlStatus.IN_PROGRESS,
            createdAt: now,
            updatedAt: now,
          },
          ConditionExpression: 'attribute_not_exists(#url)',
          ExpressionAttributeNames: { '#url': 'url' },
        })
        .promise();

      return true;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.name === 'ConditionalCheckFailedException'
      ) {
        // URL already exists — deduplication succeeded
        return false;
      }
      console.error(
        '[DynamoProcessedUrlRepository] Error marking URL as processing:',
        error
      );
      throw error;
    }
  }

  async markUrlAsProcessed(url: string): Promise<void> {
    try {
      await dynamoDb
        .update({
          TableName: CONFIG.FAROS_PROCESSED_URLS_TABLE,
          Key: { url },
          UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#status': 'status',
            '#updatedAt': 'updatedAt',
          },
          ExpressionAttributeValues: {
            ':status': UrlStatus.PROCESSED,
            ':updatedAt': new Date().toISOString(),
          },
        })
        .promise();
    } catch (error) {
      console.error(
        '[DynamoProcessedUrlRepository] Error marking URL as processed:',
        error
      );
      throw error;
    }
  }

  async markUrlAsError(url: string): Promise<void> {
    try {
      await dynamoDb
        .update({
          TableName: CONFIG.FAROS_PROCESSED_URLS_TABLE,
          Key: { url },
          UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
          ExpressionAttributeNames: {
            '#status': 'status',
            '#updatedAt': 'updatedAt',
          },
          ExpressionAttributeValues: {
            ':status': UrlStatus.ERROR,
            ':updatedAt': new Date().toISOString(),
          },
        })
        .promise();
    } catch (error) {
      console.error(
        '[DynamoProcessedUrlRepository] Error marking URL as error:',
        error
      );
      throw error;
    }
  }

  async getUrlStatus(url: string): Promise<ProcessedUrl | null> {
    const result = await dynamoDb
      .get({
        TableName: CONFIG.FAROS_PROCESSED_URLS_TABLE,
        Key: { url },
      })
      .promise();

    return (result.Item as ProcessedUrl) || null;
  }
}
