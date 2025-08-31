// External Dependencies:
import { DynamoDB } from 'aws-sdk';
import AWS from 'aws-sdk';

// Internal Dependencies:
import { IDBAccountRepository } from '../../application/interfaces/IGetAccountRepository';
import {
  PaginatedAccounts,
  Account,
} from '../../domain/entities/account/AccountResponseDB';

// Handle local/production environment:
const isOffline: boolean = process.env.IS_OFFLINE === 'true';

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

// DB Account repository:
export class DBAccountRepository implements IDBAccountRepository {
  // Method to get paginated accounts:
  async getAccounts(
    pageSize: number,
    accountFilter?: string,
    nextToken?: AWS.DynamoDB.DocumentClient.Key
  ): Promise<PaginatedAccounts> {
    // Initialize the items array and lastEvaluatedKey:
    const items: Account[] = [];
    let lastEvaluatedKey = nextToken;

    // Scan the DynamoDB table until we have enough items or there are no more items:
    while (items.length < pageSize) {
      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: 'Accounts',
        Limit: 25,
        ExclusiveStartKey: lastEvaluatedKey,
      };

      // Apply account filter if provided:
      if (accountFilter) {
        params.FilterExpression = 'contains(#account, :accountValue)';
        params.ExpressionAttributeNames = { '#account': 'account' };
        params.ExpressionAttributeValues = { ':accountValue': accountFilter };
      }

      // Scan the DynamoDB table:
      const result = await dynamoDb.scan(params).promise();

      // Map the result items to the Account type:
      const newItems: Account[] = (result.Items as Account[]) || [];
      items.push(...newItems);

      // Update the lastEvaluatedKey:
      lastEvaluatedKey = result.LastEvaluatedKey;

      if (!lastEvaluatedKey) {
        break;
      }
    }

    // Return the paginated accounts:
    return {
      items: items.slice(0, pageSize),
      nextToken: items.length > pageSize ? lastEvaluatedKey : undefined,
    };
  }
}
