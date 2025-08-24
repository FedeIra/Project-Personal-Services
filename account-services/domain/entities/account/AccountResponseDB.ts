import AWS from 'aws-sdk';

// DB Account response:
export type DynamoKey = AWS.DynamoDB.DocumentClient.Key;

export interface Account {
  account: string;
  user: string;
  password: string;
}

export interface PaginatedAccounts {
  items: Account[];
  nextToken?: DynamoKey;
}
