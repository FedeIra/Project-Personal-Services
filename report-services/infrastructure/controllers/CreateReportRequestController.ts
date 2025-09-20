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

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Espera un archivo CSV en el body (multipart/form-data)
      const email = (request.params as ReportParams).email;
      const file = await request.file();

      if (!file) {
        reply.code(400).send({ message: 'CSV file is required.' });
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
}
