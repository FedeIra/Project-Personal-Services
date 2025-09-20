// External Dependencies:
import { v4 as uuidv4 } from 'uuid';
import { MultipartFile } from '@fastify/multipart';

// Internal Dependencies:
import { S3Repository } from '../../infrastructure/repositories/S3Repository';
import { ReportRequestRepository } from '../../infrastructure/repositories/DynamoRequestReportRepository';
import { SQSRepository } from '../../infrastructure/repositories/SQSRepository';
import {
  ReportRequest,
  ReportStatus,
} from '../../domain/ReportRequestResponseDB';

export class CreateReportRequestUseCase {
  constructor(
    private readonly s3Repo: S3Repository,
    private readonly reportRepo: ReportRequestRepository,
    private readonly sqsRepo: SQSRepository
  ) {}

  async execute(email: string, file: MultipartFile): Promise<string> {
    // 1) Upload csv to S3:
    const date: string = new Date().toISOString().split('T')[0];
    const id: string = uuidv4();
    const s3Key: string = `reports/request/${date}/${id}.csv`;
    await this.s3Repo.uploadCSVFile(s3Key, file);

    // 2) Create report request in DynamoDB:
    const reportRequest: ReportRequest = {
      id,
      email,
      status: ReportStatus.NEW,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      request: s3Key,
      response: null,
    };
    await this.reportRepo.createReportRequest(reportRequest);

    // 3) Send message to SQS FIFO queue:
    await this.sqsRepo.sendMessageToFifoQueue(id, email);

    // 4) Return report request id
    return id;
  }
}
