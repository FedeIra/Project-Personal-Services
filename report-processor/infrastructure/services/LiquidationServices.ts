import { ILiquidationServices } from '../../application/interfaces/ILiquidationService';
import { EmploymentData } from '../../types/types';

// Service to handle liquidation operations:
export class LiquidationServices implements ILiquidationServices {
  async buildTerminationLiquidation(
    employmentData: EmploymentData
  ): Promise<any> {
    // Implement the logic to build termination liquidation report
    // Calculate seniority using stardDate and endDate. Need to know amount of years and months:
    // in private method:
    const { years, months, days } = this.calculateSeniority(
      employmentData.realStartDate ?? employmentData.recordedStartDate, // '2024-08-01T03:00:00.000Z'
      employmentData.endDate // '2025-05-21T03:00:00.000Z'
    );

    const seniorityCompensation = this.calculateSeniorityCompensation(
      employmentData.bestMonthlySalary ?? employmentData.grossSalary,
      years,
      months
    );

    const priorNoticeCompensation = employmentData.priorNotice
      ? employmentData.grossSalary
      : 0;

    return employmentData;
  }

  // Calculate employment seniority in years and months
  private calculateSeniority(
    startDate: string,
    endDate: string
  ): { years: number; months: number; days: number } {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    const days = end.getDate() - start.getDate();

    // Adjust if end day is before start day in the month
    if (days < 0) {
      months--;
    }

    // Adjust if months are negative
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  }

  // Calculate seniority compensation:
  private calculateSeniorityCompensation(
    bestMonthlySalary: number,
    years: number,
    months: number
  ): number {
    // one salary per year and if there are still more than 3 months an additional salary
    let seniorityCompensation = years * bestMonthlySalary;
    if (months >= 3) {
      seniorityCompensation += bestMonthlySalary;
    }
    return seniorityCompensation;
  }

  // Calculate prior notice
  //
}
