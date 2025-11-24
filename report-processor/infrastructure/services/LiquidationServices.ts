import { ILiquidationServices } from '../../application/interfaces/ILiquidationService';
import { EmploymentData } from '../../types/types';

// Service to handle liquidation operations:
export class LiquidationServices implements ILiquidationServices {
  async buildTerminationLiquidation(
    employmentData: EmploymentData
  ): Promise<any> {
    // Calculate seniority:
    const { years, months, days } = this.calculateSeniority(
      employmentData.realStartDate ?? employmentData.recordedStartDate, // '2024-08-01T03:00:00.000Z'
      employmentData.endDate // '2025-05-21T03:00:00.000Z'
    );

    // Calculate worked days of termination month:
    const workedDaysTerminationMonth = this.calculateDaysInTerminationMonth(
      employmentData.endDate
    );

    const seniorityCompensation = this.calculateSeniorityCompensation(
      employmentData.bestMonthlySalary ?? employmentData.grossSalary,
      years,
      months
    );

    const SACseniorityCompensation = this.calculateSAC(
      seniorityCompensation,
      employmentData.buenosAires
    );

    const priorNoticeCompensation = this.calculatePriorNoticeCompensation(
      employmentData.grossSalary,
      employmentData.bestMonthlySalary,
      employmentData.priorNotice
    );

    const SACpriorNoticeCompensation = this.calculateSAC(
      priorNoticeCompensation,
      employmentData.priorNotice
    );

    const integrationCompensation = this.calculateIntegrationCompensation(
      employmentData.endDate,
      employmentData.grossSalary,
      employmentData.bestMonthlySalary,
      workedDaysTerminationMonth
    );

    const SACintegrationCompensation = this.calculateSAC(
      integrationCompensation,
      employmentData.priorNotice
    );

    const workedDaysCompensation = this.calculateWorkedDayCompensation(
      employmentData.endDate,
      employmentData.grossSalary,
      employmentData.bestMonthlySalary,
      workedDaysTerminationMonth
    );

    // TODO: Falta: SAC proporcional, vacaciones proporcionales, SAC sobre vacaciones proporcionales.
    // TODO: multas por omisión de registro o registro deficiente.

    return employmentData;
  }

  // Calculate employment seniority in years and months:
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

  // Calculate SAC over seniority compensation:
  private calculateSAC(compensation: number, condition: boolean): number {
    return condition ? compensation / 12 : 0;
  }

  // Calculate days in termination month:
  private calculateDaysInTerminationMonth(endDate: string): number {
    const end = new Date(endDate);
    return new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
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

  // Calculate prior notice compensation:
  private calculatePriorNoticeCompensation(
    grossSalary: number,
    bestMonthlySalary: number,
    priorNotice: boolean
  ): number {
    return priorNotice ? (grossSalary ?? bestMonthlySalary) : 0;
  }

  // Calculate integration compensation:
  private calculateIntegrationCompensation(
    endDate: string,
    grossSalary: number,
    bestMonthlySalary: number,
    daysInMonth: number
  ): number {
    const monthPendingDays: number =
      daysInMonth - new Date(endDate).getDate() + 1;
    const dailySalary: number =
      (grossSalary ?? bestMonthlySalary) / daysInMonth;
    return dailySalary * monthPendingDays;
  }

  // Calculate worked days of month:
  private calculateWorkedDayCompensation(
    endDate: string,
    grossSalary: number,
    bestMonthlySalary: number,
    daysInMonth: number
  ): number {
    const dailySalary: number =
      (grossSalary ?? bestMonthlySalary) / daysInMonth;
    return dailySalary * new Date(endDate).getDate();
  }
}
