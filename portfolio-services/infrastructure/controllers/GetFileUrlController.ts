import { FastifyRequest, FastifyReply } from 'fastify';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';
import { GetFileUrlUseCase } from '../../application/usecases/GetFileUrlUseCase';
import { IFileRepository } from '../../application/interfaces/IFileRepository';

interface FileNameParams {
  fileName: string;
}

export class GetFileUrlController {
  private readonly useCase: GetFileUrlUseCase;

  constructor(repository: IFileRepository) {
    this.useCase = new GetFileUrlUseCase(repository);
  }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { fileName } = request.params as FileNameParams;

      if (!fileName) {
        const response = buildResponse({
          status: 'error',
          codeStatus: 400,
          errorMessage: 'Missing required path parameter: fileName',
        });
        reply.code(response.statusCode).send(response.body);
        return;
      }

      const url = await this.useCase.execute(decodeURIComponent(fileName));
      const response = buildResponse({
        status: 'success',
        codeStatus: 200,
        data: { url },
      });
      reply.code(response.statusCode).send(response.body);
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error);
      reply.code(errorResponse.statusCode).send(errorResponse.body);
    }
  }
}
