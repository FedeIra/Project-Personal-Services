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
  recordedStartDate: string;
  realStartDate: string;
  endDate: string;
  includePriorNotice: boolean;
  previousVacationBalance: number;
  buenosAires: boolean;
  registered: boolean;
}

export interface SeniorityAndTerminationData {
  years: number;
  months: number;
  days: number;
  terminationMonth: {
    daysInMonth: number;
    workedDays: number;
    pendingDays: number;
  };
}
