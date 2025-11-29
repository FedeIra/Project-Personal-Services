import { ILiquidationServices } from '../../application/interfaces/ILiquidationService';
import { EmploymentData, SeniorityAndTerminationData } from '../../types/types';

// Service to handle liquidation operations:
export class LiquidationServices implements ILiquidationServices {
  async buildTerminationLiquidation(
    employmentData: EmploymentData
  ): Promise<any> {
    // TODO: mock up employment data:
    employmentData = {
      grossSalary: 37079.34,
      bestMonthlySalary: 37079.34,
      recordedStartDate: '2016-02-14T03:00:00.000Z',
      realStartDate: '2016-02-14T03:00:00.000Z',
      endDate: '2020-07-22T03:00:00.000Z',
      includePriorNotice: true,
      previousVacationBalance: 0,
      buenosAires: true,
      registered: true,
    };

    // Seniority, worked and pending days of month:
    const seniorityAndTerminationData: SeniorityAndTerminationData =
      this.calculateSeniorityAndTerminationMonth(
        employmentData.realStartDate ?? employmentData.recordedStartDate,
        employmentData.endDate
      );

    // Salary base calculations:
    const { baseSalary, bestSalary, dailySalary } = this.calculateBaseSalaries(
      employmentData.grossSalary,
      employmentData.bestMonthlySalary,
      seniorityAndTerminationData.terminationMonth.daysInMonth
    );

    // Worked days of termination month compensation:
    const workedDaysCompensation: number = this.calculateWorkedDaysCompensation(
      dailySalary,
      seniorityAndTerminationData.terminationMonth.workedDays
    );

    // Proportional SAC compensation:
    const proportionalSACCompensation: number = this.calculateProportionalSAC(
      employmentData.endDate,
      bestSalary
    );

    // Proportional Vacaciones compensation:
    const proportionalVacationCompensation: number =
      this.calculateProportionalVacationCompensation(
        employmentData.endDate,
        seniorityAndTerminationData.years,
        bestSalary
      );

    // SAC over proportional vacaciones compensation:
    const SACproportionalVacationCompensation: number = this.calculateSAC(
      proportionalVacationCompensation,
      true
    );

    // Seniority compensation:
    const seniorityCompensation: number = this.calculateSeniorityCompensation(
      bestSalary,
      seniorityAndTerminationData.years,
      seniorityAndTerminationData.months
    );

    // SAC over seniority compensation:
    const SACseniorityCompensation: number = this.calculateSAC(
      seniorityCompensation,
      employmentData.buenosAires
    );

    // Prior notice compensation:
    const priorNoticeCompensation: number =
      this.calculatePriorNoticeCompensation(
        baseSalary,
        employmentData.includePriorNotice
      );

    // SAC over prior notice compensation:
    const SACpriorNoticeCompensation: number = this.calculateSAC(
      priorNoticeCompensation,
      employmentData.includePriorNotice
    );

    // Integration compensation:
    const integrationCompensation: number =
      this.calculateIntegrationCompensation(
        dailySalary,
        seniorityAndTerminationData.terminationMonth.pendingDays
      );

    // SAC over integration compensation:
    const SACintegrationCompensation: number = this.calculateSAC(
      integrationCompensation,
      true
    );

    // TODO: multas por omisión de registro o registro deficiente.

    return employmentData;
  }

  // Calculate employment seniority in years and months:
  private calculateSeniorityAndTerminationMonth(
    startDate: string,
    endDate: string
  ): SeniorityAndTerminationData {
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

    const daysInMonth: number = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)
    ).getUTCDate();
    const workedDays = end.getUTCDate();
    const pendingDays = daysInMonth - workedDays;

    return {
      years,
      months,
      days,
      terminationMonth: {
        daysInMonth,
        workedDays,
        pendingDays,
      },
    };
  }

  // Calculate base salaries for liquidation calculations
  private calculateBaseSalaries(
    grossSalary: number,
    bestMonthlySalary: number,
    daysInMonth: number
  ): { baseSalary: number; bestSalary: number; dailySalary: number } {
    const baseSalary = grossSalary ?? bestMonthlySalary;
    const bestSalary = bestMonthlySalary ?? grossSalary;
    const dailySalary = baseSalary / daysInMonth;

    return {
      baseSalary,
      bestSalary,
      dailySalary,
    };
  }

  // Calculate days in termination month:
  private calculateWorkedDaysCompensation(
    dailySalary: number,
    workedDays: number
  ): number {
    return dailySalary * workedDays;
  }

  // Calculate proportional SAC:
  private calculateProportionalSAC(
    endDate: string,
    bestSalary: number
  ): number {
    const end = new Date(endDate);
    let periodStart: Date;
    let periodEnd: Date;
    if (end.getMonth() < 6) {
      periodStart = new Date(end.getFullYear(), 0, 1);
      periodEnd = new Date(end.getFullYear(), 5, 30);
    } else {
      periodStart = new Date(end.getFullYear(), 7, 1);
      periodEnd = new Date(end.getFullYear(), 11, 31);
    }
    const daysWorked =
      Math.ceil(
        (end.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const totalPeriodDays =
      Math.ceil(
        (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const proportionalSAC = (bestSalary * daysWorked) / totalPeriodDays;
    return proportionalSAC;
  }

  // Calculate SAC over compensation:
  private calculateSAC(compensation: number, condition: boolean): number {
    return condition ? compensation / 12 : 0;
  }

  // Calculate seniority compensation:
  private calculateSeniorityCompensation(
    bestMonthlySalary: number,
    years: number,
    months: number
  ): number {
    // one salary per year and if there are still more than 3 months an additional salary:
    let seniorityCompensation = years * bestMonthlySalary;
    if (months >= 3) {
      seniorityCompensation += bestMonthlySalary;
    }
    return seniorityCompensation;
  }

  // Calculate prior notice compensation:
  private calculatePriorNoticeCompensation(
    baseSalary: number,
    includePriorNotice: boolean
  ): number {
    return includePriorNotice ? baseSalary : 0;
  }

  // Calculate integration compensation:
  private calculateIntegrationCompensation(
    dailySalary: number,
    pendingDays: number
  ): number {
    return dailySalary * pendingDays;
  }

  private calculateProportionalVacationCompensation(
    endDate: string,
    seniorityYears: number,
    bestSalary: number
  ): number {
    const end = new Date(endDate);
    const endYear: number = end.getFullYear();

    // Determine vacation days based on seniority:
    const vacationDaysPerYear: number =
      this.getVacationDaysBySeniority(seniorityYears);

    // Calculate worked days in the termination year:
    const yearStart = new Date(endYear, 0, 1);
    const workedDaysInYear: number =
      Math.ceil((end.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) +
      1;

    // Calculate proportional vacation days:
    const proportionalVacationDays: number = Math.floor(
      (vacationDaysPerYear * workedDaysInYear) / 365
    );

    // Calculate daily vacation value:
    const dailyVacationValue: number = bestSalary / 25;

    // Calculate proportional vacations compensation:
    const proportionalVacationsCompensation: number =
      dailyVacationValue * proportionalVacationDays;

    return proportionalVacationsCompensation;
  }

  // Determine vacation days based on seniority:
  private getVacationDaysBySeniority(years: number): number {
    if (years <= 5) {
      return 14;
    } else if (years <= 10) {
      return 21;
    } else if (years <= 20) {
      return 28;
    } else {
      return 35;
    }
  }
}
