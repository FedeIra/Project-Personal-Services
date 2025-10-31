export interface ReportRequest {
  id: string;
  email: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  request: string | null;
  response: string | null;
}

// enum for status:
export enum ReportStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
  ERROR = 'error',
  WARNING = 'warning',
}
