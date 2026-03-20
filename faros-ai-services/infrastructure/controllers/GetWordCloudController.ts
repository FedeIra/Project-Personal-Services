// External Dependencies:
import { FastifyRequest, FastifyReply } from 'fastify';

// Internal Dependencies:
import { GetWordCloudUseCase } from '../../application/usecases/GetWordCloudUseCase';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';

interface GetWordCloudQuery {
  top?: string;
}

const DEFAULT_TOP = 10;
const MAX_TOP = 1000;

export class GetWordCloudController {
  constructor(private readonly useCase: GetWordCloudUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { top: topParam } = request.query as GetWordCloudQuery;

      // Parse and validate 'top' parameter
      const top = topParam ? parseInt(topParam, 10) : DEFAULT_TOP;

      if (isNaN(top) || top < 1) {
        const response = buildResponse({
          status: 'error',
          codeStatus: 400,
          errorMessage: 'Query parameter "top" must be a positive integer.',
        });
        reply.code(response.statusCode).send(response.body);
        return;
      }

      const effectiveTop = Math.min(top, MAX_TOP);

      // Execute use case — reads from in-memory cache, fast O(1) response
      const words = await this.useCase.execute(effectiveTop);

      const response = buildResponse({
        status: 'success',
        codeStatus: 200,
        data: words,
      });

      reply.code(response.statusCode).send(response.body);
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error);
      reply.code(errorResponse.statusCode).send(errorResponse.body);
    }
  }
}
