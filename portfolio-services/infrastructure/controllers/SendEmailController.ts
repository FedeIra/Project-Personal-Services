import { FastifyRequest, FastifyReply } from 'fastify';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';
import { SendEmailUseCase } from '../../application/usecases/SendEmailUseCase';
import { IEmailService } from '../../application/interfaces/IEmailService';

interface SendEmailBody {
  from_name: string;
  reply_to: string;
  message: string;
}

export class SendEmailController {
  private readonly useCase: SendEmailUseCase;

  constructor(emailService: IEmailService) {
    this.useCase = new SendEmailUseCase(emailService);
  }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { from_name, reply_to, message } = request.body as SendEmailBody;

      if (!from_name || !reply_to || !message) {
        const response = buildResponse({
          status: 'error',
          codeStatus: 400,
          errorMessage:
            'Missing required fields: from_name, reply_to and message are required',
        });
        reply.code(response.statusCode).send(response.body);
        return;
      }

      await this.useCase.execute({ from_name, reply_to, message });
      const response = buildResponse({
        status: 'success',
        codeStatus: 200,
        data: { message: 'Email sent successfully' },
      });
      reply.code(response.statusCode).send(response.body);
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error);
      reply.code(errorResponse.statusCode).send(errorResponse.body);
    }
  }
}
