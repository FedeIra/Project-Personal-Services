// External Dependencies:
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateReportRequestUseCase } from '../../application/usecases/CreateReportRequestUseCase';
import { MultipartFile } from '@fastify/multipart';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';

interface ReportParams {
  email: string;
}

export class CreateReportRequestController {
  constructor(private readonly useCase: CreateReportRequestUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const email = (request.params as ReportParams).email;
      const file = await request.file();

      if (!email || !this.isValidEmail(email)) {
        reply
          .code(400)
          .send({ message: 'Email parameter is required and must be valid.' });
        return;
      }

      if (!file || !this.isCSVFile(file)) {
        reply
          .code(400)
          .send({ message: 'CSV file is required and must be valid.' });
        return;
      }

      const data: string = await this.useCase.execute(
        email,
        file as MultipartFile
      );

      const response = buildResponse({
        status: 'success',
        codeStatus: 201,
        data,
      });

      reply.code(response.statusCode).send(response.body);
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error);
      reply.code(errorResponse.statusCode).send(errorResponse.body);
    }
  }

  // [Mejora] Validación de email simple
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // [Mejora] Validación de archivo CSV por mimetype y extensión
  private isCSVFile(file: MultipartFile): boolean {
    const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel'];
    const allowedExtensions = ['.csv'];
    const fileName = file.filename || '';
    return (
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.some((ext) => fileName.endsWith(ext))
    );
  }
}
