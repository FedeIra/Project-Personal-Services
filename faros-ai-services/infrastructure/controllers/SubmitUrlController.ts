// External Dependencies:
import { FastifyRequest, FastifyReply } from 'fastify';

// Internal Dependencies:
import { SubmitUrlUseCase } from '../../application/usecases/SubmitUrlUseCase';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';

interface SubmitUrlQuery {
  url?: string;
}

export class SubmitUrlController {
  constructor(private readonly useCase: SubmitUrlUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { url } = request.query as SubmitUrlQuery;

      // Validate URL is present
      if (!url) {
        const response = buildResponse({
          status: 'error',
          codeStatus: 400,
          errorMessage:
            'Query parameter "url" is required. Example: POST /wordcloud?url=https://amazon.com/...',
        });
        reply.code(response.statusCode).send(response.body);
        return;
      }

      // Validate URL format (must be an Amazon URL)
      if (!this.isValidAmazonUrl(url)) {
        const response = buildResponse({
          status: 'error',
          codeStatus: 400,
          errorMessage:
            'URL must be a valid Amazon product URL (e.g., https://www.amazon.com/gp/product/...)',
        });
        reply.code(response.statusCode).send(response.body);
        return;
      }

      // Execute use case
      const result = await this.useCase.execute(url);

      const statusCode = result.submitted ? 202 : 200;

      // Build and send response
      const response = buildResponse({
        status: 'success',
        codeStatus: statusCode,
        data: { message: result.message, url },
      });

      reply.code(response.statusCode).send(response.body);
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error);
      reply.code(errorResponse.statusCode).send(errorResponse.body);
    }
  }

  private isValidAmazonUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname === 'amazon.com' ||
        parsed.hostname.endsWith('.amazon.com')
      );
    } catch {
      return false;
    }
  }
}
