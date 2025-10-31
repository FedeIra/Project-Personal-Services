// Internal Dependencies:
import { ReportRequest } from '../../domain/ReportRequestResponseDB';

// Interface for getting account repository:
export interface IReportRequestRepository {
  createReportRequest(reportRequest: ReportRequest): Promise<string>;
}
