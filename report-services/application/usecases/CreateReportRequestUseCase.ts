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
    private readonly s3Repository: S3Repository,
    private readonly reportRequestRepository: ReportRequestRepository,
    private readonly sqsRepository: SQSRepository
  ) {}

  async execute(email: string, file: MultipartFile): Promise<string> {
    // 1) Upload csv to S3:
    const now = new Date().toISOString();
    const date: string = now.split('T')[0];
    const id: string = uuidv4();
    const s3Key: string = `reports/request/${date}/${encodeURIComponent(email)}/${id}.csv`;
    await this.s3Repository.uploadCSVFile(s3Key, file);

    // 2) Create report request in DynamoDB:
    const reportRequest: ReportRequest = {
      id,
      email,
      status: ReportStatus.NEW,
      createdAt: now,
      updatedAt: now,
      request: s3Key,
      response: null,
    };
    await this.reportRequestRepository.createReportRequest(reportRequest);

    // 3) Send message to SQS FIFO queue:
    const sqsMessage = {
      id,
      reportType: 'termination_liquidation',
    };

    await this.sqsRepository.sendMessageToFifoQueue(
      JSON.stringify(sqsMessage),
      email
    );

    // 4) Return report request id
    return id;
  }
}
