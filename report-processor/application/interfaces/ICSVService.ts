import { EmploymentData } from '../../types/types';

// Interface for CSV service operations:
export interface ICSVServices {
  parseEmploymentCSVToJson(buffer: Buffer): Promise<EmploymentData>;
}
