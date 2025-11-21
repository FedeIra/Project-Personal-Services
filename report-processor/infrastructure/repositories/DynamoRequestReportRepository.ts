// External Dependencies:
import { DynamoDB } from 'aws-sdk';

// Internal Dependencies:
import { IReportRequestRepository } from '../../application/interfaces/IDynamoRequestReportRepository';
import { ReportRequest } from '../../application/domain/ReportRequestResponseDB';
import { CONFIG } from '../../config/constants';

// Handle local/production environment:
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

// DB Report Request repository:
export class ReportRequestRepository implements IReportRequestRepository {
  // Method to get a report request by ID:
  async getReportRequestById(id: string): Promise<ReportRequest | null> {
    const params: DynamoDB.DocumentClient.GetItemInput = {
      TableName: CONFIG.REPORT_REQUESTS_TABLE,
      Key: { id },
    };
    const result = await dynamoDb.get(params).promise();
    return result.Item as ReportRequest | null;
  }
}
