import { S3Repository } from '../infrastructure/repositories/S3Repository';
import { ReportRequestRepository } from '../infrastructure/repositories/DynamoRequestReportRepository';

export type Envelope<T = unknown> = {
  version?: string;
  payload: T;
};

export type GenerateReport = {
  id: string;
  reportType: string;
};

export interface HandlerContext {
  reportRequestRepository: ReportRequestRepository;
  s3Repository: S3Repository;
}
