import { FastifyRequest, FastifyReply } from 'fastify';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';
import { GetCommentsUseCase } from '../../application/usecases/GetCommentsUseCase';
import { ICommentRepository } from '../../application/interfaces/ICommentRepository';

export class GetCommentsController {
  private readonly useCase: GetCommentsUseCase;

  constructor(repository: ICommentRepository) {
    this.useCase = new GetCommentsUseCase(repository);
  }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const comments = await this.useCase.execute();
      const response = buildResponse({
        status: 'success',
        codeStatus: 200,
        data: comments,
      });
      reply.code(response.statusCode).send(response.body);
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error);
      reply.code(errorResponse.statusCode).send(errorResponse.body);
    }
  }
}
