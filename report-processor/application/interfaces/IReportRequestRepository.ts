// Internal Dependencies:
import { ReportRequest } from '../domain/ReportRequestResponseDB';

// Interface for account repository operations:
export interface IReportRequestRepository {
  getReportRequestById(id: string): Promise<ReportRequest | null>;
}
