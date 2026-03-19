import { FastifyRequest, FastifyReply } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import {
  buildResponse,
  ErrorHandler,
} from '../../../common/utils/ResponseBuilder';
import { UploadFileUseCase } from '../../application/usecases/UploadFileUseCase';
import { IFileRepository } from '../../application/interfaces/IFileRepository';

export class UploadFileController {
  private readonly useCase: UploadFileUseCase;

  constructor(repository: IFileRepository) {
    this.useCase = new UploadFileUseCase(repository);
  }

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const file: MultipartFile | undefined = await request.file();

      if (!file) {
        const response = buildResponse({
          status: 'error',
          codeStatus: 400,
          errorMessage: 'No file provided',
        });
        reply.code(response.statusCode).send(response.body);
        return;
      }

      const buffer = await file.toBuffer();

      if (!buffer || buffer.length === 0) {
        const response = buildResponse({
          status: 'error',
          codeStatus: 400,
          errorMessage: 'File is empty',
        });
        reply.code(response.statusCode).send(response.body);
        return;
      }

      await this.useCase.execute(
        file.filename || 'upload',
        buffer,
        file.mimetype
      );
      const response = buildResponse({
        status: 'success',
        codeStatus: 200,
        data: {
          message: 'File uploaded successfully',
          fileName: file.filename,
        },
      });
      reply.code(response.statusCode).send(response.body);
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error);
      reply.code(errorResponse.statusCode).send(errorResponse.body);
    }
  }
}
