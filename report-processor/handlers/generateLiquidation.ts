import { ReportRequest } from '../application/domain/ReportRequestResponseDB';
import { GenerateReport, HandlerContext } from '../types/types';

export class GenerateLiquidationHandler {
  public readonly type = 'termination_liquidation';

  constructor(private readonly ctx: HandlerContext) {}

  async handle(payload: GenerateReport): Promise<void> {
    console.log('[GenerateLiquidationHandler] Processing payload:', {
      id: payload.id,
      reportType: payload.reportType,
    });

    // 1. Buscar el registro en DynamoDB usando id:
    const record: ReportRequest | null =
      await this.ctx.reportRequestRepository.getReportRequestById(payload.id);

    if (!record || !record.request) {
      throw new Error(`Record with id ${payload.id} not found.`);
    }

    // 2. Obtener el archivo s3 utilizando el record.request que es el path del archivo en s3:
    const csvBuffer: Buffer = await this.ctx.s3Repository.getFile(
      record.request
    );

    // 3. Parsear el archivo CSV a JSON
    const employeeData = await this.ctx.CSVService.parseCSVToJson(csvBuffer);

    // 3. Procesar el archivo CSV desde S3
    // 4. Generar el reporte de liquidación
    // 5. Actualizar el estado en DynamoDB
    // 6. Guardar liquidación generada en S3
    // 7. Enviar el reporte por email
  }
}
