import { FastifyRequest, FastifyReply } from 'fastify';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';
import { CreateCommentUseCase } from '../../application/usecases/CreateCommentUseCase';
import { ICommentRepository } from '../../application/interfaces/ICommentRepository';

interface CreateCommentBody {
  commentId: number;
  username: string;
  content: string;
  date: string;
}

export class CreateCommentController {
  private readonly useCase: CreateCommentUseCase;

  constructor(repository: ICommentRepository) {
    this.useCase = new CreateCommentUseCase(repository);
  }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { commentId, username, content, date } =
        request.body as CreateCommentBody;

      if (!commentId || !content) {
        const response = buildResponse({
          status: 'error',
          codeStatus: 400,
          errorMessage:
            'Missing required fields: commentId and content are required',
        });
        reply.code(response.statusCode).send(response.body);
        return;
      }

      const comment = await this.useCase.execute({
        commentId: String(commentId),
        username,
        content,
        date,
      });
      const response = buildResponse({
        status: 'success',
        codeStatus: 201,
        data: comment,
      });
      reply.code(response.statusCode).send(response.body);
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error);
      reply.code(errorResponse.statusCode).send(errorResponse.body);
    }
  }
}
