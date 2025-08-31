// Script to add accounts to DynamoDB:

// External Dependencies:
import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { EncryptionService } from '../../account-services/infrastructure/services/EncryptionService';

dotenv.config();

// DynamoDB configuration:
const dynamoDb = new AWS.DynamoDB.DocumentClient({
  // Prod:
  region: 'us-east-2',
  // Test:
  // region: 'localhost',
  // endpoint: 'http://localhost:8000',
  // accessKeyId: 'fakeMyKeyId',
  // secretAccessKey: 'fakeSecretAccessKey',
});

if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be exactly 64 characters long.');
}
// List of accounts to insert:
const accounts = [
  {
    account: 'xxxx',
    user: 'xxxx',
    password: 'xxxx',
  },
];

// Method to insert accounts into DynamoDB:
const insertAccounts = async (): Promise<void> => {
  try {
    for (const entry of accounts) {
      const encryptedPassword = EncryptionService.encrypt(entry.password);

      const params = {
        TableName: 'Accounts',
        Item: {
          account: entry.account,
          user: entry.user,
          password: encryptedPassword,
        },
      };

      await dynamoDb.put(params).promise();
      console.log(`Inserted: ${entry.account} - ${entry.user}`);
    }

    console.log('All accounts inserted successfully.');
  } catch (error) {
    console.error('Error inserting accounts:', error);
  }
};

insertAccounts();
