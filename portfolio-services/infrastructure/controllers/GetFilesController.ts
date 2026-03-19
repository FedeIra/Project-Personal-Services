import { FastifyRequest, FastifyReply } from 'fastify';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';
import { GetFilesUseCase } from '../../application/usecases/GetFilesUseCase';
import { IFileRepository } from '../../application/interfaces/IFileRepository';

export class GetFilesController {
  private readonly useCase: GetFilesUseCase;

  constructor(repository: IFileRepository) {
    this.useCase = new GetFilesUseCase(repository);
  }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const files = await this.useCase.execute();
      const response = buildResponse({
        status: 'success',
        codeStatus: 200,
        data: files,
      });
      reply.code(response.statusCode).send(response.body);
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error);
      reply.code(errorResponse.statusCode).send(errorResponse.body);
    }
  }
}
