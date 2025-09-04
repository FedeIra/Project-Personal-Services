export interface ReportRequest {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  request: string | null;
  response: string | null;
}
