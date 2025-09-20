// External Dependencies:
import { DynamoDB } from 'aws-sdk';

// Internal Dependencies:
import { IReportRequestRepository } from '../../application/interfaces/IReportRequestRepository';
import { ReportRequest } from '../../domain/ReportRequestResponseDB';

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

// DB Report Request repository:
export class ReportRequestRepository implements IReportRequestRepository {
  // Method to create a report request:
  async createReportRequest(reportRequest: ReportRequest): Promise<string> {
    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.REPORT_REQUESTS_TABLE || '',
      Item: reportRequest,
    };
    await dynamoDb.put(params).promise();
    return reportRequest.id || '';
  }
}
