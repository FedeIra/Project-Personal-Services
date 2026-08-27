// Create DynamoDB tables for local development:
import AWS from 'aws-sdk';

interface TableDefinition {
  TableName: string;
  KeySchema: AWS.DynamoDB.KeySchemaElement[];
  AttributeDefinitions: AWS.DynamoDB.AttributeDefinition[];
  ProvisionedThroughput: AWS.DynamoDB.ProvisionedThroughput;
  GlobalSecondaryIndexes?: AWS.DynamoDB.GlobalSecondaryIndexList;
}

const dynamoDb = new AWS.DynamoDB({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
  accessKeyId: 'fakeMyKeyId',
  secretAccessKey: 'fakeSecretAccessKey',
});

const tables: TableDefinition[] = [
  // [Faros AI Word Cloud] - URL deduplication table:
  {
    TableName: 'FarosProcessedUrls',
    KeySchema: [{ AttributeName: 'url', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'url', AttributeType: 'S' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  // [Faros AI Word Cloud] - Word frequency counts table:
  {
    TableName: 'FarosWordCounts',
    KeySchema: [{ AttributeName: 'word', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'word', AttributeType: 'S' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  {
    TableName: 'UserCredentials',
    KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  {
    TableName: 'Accounts',
    KeySchema: [
      { AttributeName: 'account', KeyType: 'HASH' },
      { AttributeName: 'user', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'account', AttributeType: 'S' },
      { AttributeName: 'user', AttributeType: 'S' },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  {
    TableName: 'Accounts',
    KeySchema: [
      { AttributeName: 'account', KeyType: 'HASH' },
      { AttributeName: 'user', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'account', AttributeType: 'S' },
      { AttributeName: 'user', AttributeType: 'S' },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },
  {
    TableName: 'ReportRequests',
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ByEmail',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
      {
        IndexName: 'ByStatus',
        KeySchema: [
          { AttributeName: 'status', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },
];

const createTables = async (): Promise<void> => {
  for (const table of tables) {
    try {
      console.log(`Creating table: ${table.TableName}`);
      await dynamoDb.createTable(table).promise();
      console.log(`Table created: ${table.TableName}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === 'ResourceInUseException') {
        console.log(`Table already exists: ${table.TableName}`);
      } else {
        console.error(`Failed to create table ${table.TableName}`, error);
      }
    }
  }
};

createTables();
