// Script to add user to DynamoDB:

// External Dependencies:
import AWS from 'aws-sdk';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const email = process.env.USER_EMAIL;
const plainPassword = process.env.USER_PASSWORD;

if (!email || !plainPassword) {
  console.error('USER_EMAIL o USER_PASSWORD not inserted in .env file.');
  process.exit(1);
}

// DynamoDB configuration:
const dynamoDb = new AWS.DynamoDB.DocumentClient({
  // Prod:
  // region: 'us-east-2',
  // Test:
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey',
});

const saltRounds = 10;

// Method to insert user into DynamoDB:
const insertUser = async (): Promise<void> => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const params = {
      TableName: 'UserCredentials',
      Item: {
        email,
        password: hashedPassword,
      },
    };

    await dynamoDb.put(params).promise();
    console.log('User inserted.');
  } catch (error) {
    console.error('Error inserting user:', error);
  }
};

insertUser();
