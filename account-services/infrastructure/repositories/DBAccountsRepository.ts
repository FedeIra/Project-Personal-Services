// External Dependencies:
import { DynamoDB } from 'aws-sdk';

// Internal Dependencies:
import AWS from 'aws-sdk';
import { IDBAccountRepository } from '../../application/interfaces/IGetAccountRepository';
import {
  PaginatedAccounts,
  Account,
} from '../../domain/entities/account/AccountResponseDB';

const isOffline = process.env.IS_OFFLINE === 'true';

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
  async getAccounts(
    pageSize: number,
    accountFilter?: string,
    nextToken?: AWS.DynamoDB.DocumentClient.Key
  ): Promise<PaginatedAccounts> {
    const items: Account[] = [];
    let lastEvaluatedKey = nextToken;

    while (items.length < pageSize) {
      const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: 'Accounts',
        Limit: 25,
        ExclusiveStartKey: lastEvaluatedKey,
      };

      if (accountFilter) {
        params.FilterExpression = 'contains(#account, :accountValue)';
        params.ExpressionAttributeNames = { '#account': 'account' };
        params.ExpressionAttributeValues = { ':accountValue': accountFilter };
      }

      const result = await dynamoDb.scan(params).promise();

      const newItems = (result.Items as Account[]) || [];
      items.push(...newItems);

      lastEvaluatedKey = result.LastEvaluatedKey;

      if (!lastEvaluatedKey) {
        break;
      }
    }

    return {
      items: items.slice(0, pageSize),
      nextToken: items.length > pageSize ? lastEvaluatedKey : undefined,
    };
  }
}
