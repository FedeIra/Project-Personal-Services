import { EmploymentData } from '../../types/types';

export interface ILiquidationServices {
  // Define methods related to liquidation services here
  buildTerminationLiquidation(employmentData: EmploymentData): Promise<any>;
}
