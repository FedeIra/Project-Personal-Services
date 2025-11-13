// Internal Dependencies:
import { ReportRequest } from '../../domain/ReportRequestResponseDB';

// Interface for account repository operations:
export interface IReportRequestRepository {
  createReportRequest(reportRequest: ReportRequest): Promise<string>;
}
