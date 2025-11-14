import { IReportRequestRepository } from '../application/interfaces/IDynamoRequestReportRepository';
import { IS3Repository } from '../application/interfaces/IS3Repository';
import { ICSVServices } from '../application/interfaces/ICSVService';

export type Envelope<T = unknown> = {
  version?: string;
  payload: T;
};

export type GenerateReport = {
  id: string;
  reportType: string;
};

export interface HandlerContext {
  reportRequestRepository: IReportRequestRepository;
  s3Repository: IS3Repository;
  CSVService: ICSVServices;
}
