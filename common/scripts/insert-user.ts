// Script to add user credentials to DynamoDB:

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

// Configurar DynamoDB para entorno local
const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-2',
  // region: 'localhost',
  // endpoint: 'http://localhost:8000',
  // accessKeyId: 'fakeMyKeyId',
  // secretAccessKey: 'fakeSecretAccessKey',
});

// Encriptar la contraseña
const saltRounds = 10;

const insertUser = async () => {
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
