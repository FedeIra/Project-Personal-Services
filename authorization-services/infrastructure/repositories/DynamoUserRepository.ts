// External dependencies:
import { DynamoDB } from 'aws-sdk';
import bcrypt from 'bcryptjs';

// Internal dependencies:
import { IUserRepository } from '../../application/interfaces/IUserRepository';

// Handle local/production environment:
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

const TABLE_NAME = 'UserCredentials';

// DynamoDB user repository implementation:
export class DynamoUserRepository implements IUserRepository {
  // Validate user credentials:
  async validateCredentials(email: string, password: string): Promise<boolean> {
    try {
      const result = await dynamoDb
        .get({
          TableName: TABLE_NAME,
          Key: { email },
        })
        .promise();

      const user = result.Item;

      if (!user || !user.password) return false;

      const isPasswordValid: boolean = await bcrypt.compare(
        password,
        user.password
      );

      return isPasswordValid;
    } catch (error) {
      return false;
    }
  }
}
