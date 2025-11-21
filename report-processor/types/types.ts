import { IReportRequestRepository } from '../application/interfaces/IDynamoRequestReportRepository';
import { IS3Repository } from '../application/interfaces/IS3Repository';
import { ICSVServices } from '../application/interfaces/ICSVService';
import { ILiquidationServices } from '../application/interfaces/ILiquidationService';

export type Envelope<T = unknown> = {
  version?: string;
  payload: T;
};

export type ReportGenerationRequest = {
  id: string;
  reportType: string;
};

export interface HandlerContext {
  reportRequestRepository: IReportRequestRepository;
  s3Repository: IS3Repository;
  CSVService: ICSVServices;
  LiquidationService: ILiquidationServices;
}

export interface EmploymentData {
  grossSalary: number;
  bestMonthlySalary: number;
  startDate: string;
  endDate: string;
  priorNotice: boolean;
}
