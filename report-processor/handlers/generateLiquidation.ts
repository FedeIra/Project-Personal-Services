import { ReportRequest } from '../application/domain/ReportRequestResponseDB';
import {
  EmploymentData,
  ReportGenerationRequest,
  HandlerContext,
} from '../types/types';

export class GenerateLiquidationHandler {
  public readonly type = 'termination_liquidation';

  constructor(private readonly ctx: HandlerContext) {}

  async handle(payload: ReportGenerationRequest): Promise<void> {
    // 1) Get report request record:
    const record: ReportRequest | null =
      await this.ctx.reportRequestRepository.getReportRequestById(payload.id);

    if (!record || !record.request) {
      throw new Error(`Record with id ${payload.id} not found.`);
    }

    // 2) Get S3 file with employment data:
    const csvBuffer: Buffer = await this.ctx.s3Repository.getFile(
      record.request
    );

    // 3) Parse CSV file to JSON:
    const employmentData: EmploymentData =
      await this.ctx.CSVService.parseEmploymentCSVToJson(csvBuffer);

    // 4) Generate liquidation report
    const terminationLiquidation =
      await this.ctx.LiquidationService.buildTerminationLiquidation(
        employmentData
      );

    console.log(
      '🚀 ~ GenerateLiquidationHandler ~ handle ~ terminationLiquidation:',
      terminationLiquidation
    );

    // 5) Update status in DynamoDB
    // 6) Save generated liquidation in S3
    // 7) Send report via email
  }
}
