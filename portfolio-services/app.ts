// External Dependencies:
import Fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';

// Internal Dependencies:
import { DynamoDBCommentRepository } from './infrastructure/repositories/DynamoDBCommentRepository';
import { S3FileRepository } from './infrastructure/repositories/S3FileRepository';
import { SESEmailService } from './infrastructure/services/SESEmailService';
import { GetCommentsController } from './infrastructure/controllers/GetCommentsController';
import { CreateCommentController } from './infrastructure/controllers/CreateCommentController';
import { SendEmailController } from './infrastructure/controllers/SendEmailController';
import { UploadFileController } from './infrastructure/controllers/UploadFileController';
import { GetFilesController } from './infrastructure/controllers/GetFilesController';
import { GetFileDataController } from './infrastructure/controllers/GetFileDataController';
import { GetFileUrlController } from './infrastructure/controllers/GetFileUrlController';
import { DownloadFileController } from './infrastructure/controllers/DownloadFileController';
import { DeleteFileController } from './infrastructure/controllers/DeleteFileController';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  await app.register(multipart);

  // Repositories and services:
  const commentRepository = new DynamoDBCommentRepository();
  const fileRepository = new S3FileRepository();
  const emailService = new SESEmailService();

  // Controllers:
  const getCommentsController = new GetCommentsController(commentRepository);
  const createCommentController = new CreateCommentController(
    commentRepository
  );
  const sendEmailController = new SendEmailController(emailService);
  const uploadFileController = new UploadFileController(fileRepository);
  const getFilesController = new GetFilesController(fileRepository);
  const getFileDataController = new GetFileDataController(fileRepository);
  const getFileUrlController = new GetFileUrlController(fileRepository);
  const downloadFileController = new DownloadFileController(fileRepository);
  const deleteFileController = new DeleteFileController(fileRepository);

  // Comments routes:
  app.get('/portfolio/comments', (request, reply) =>
    getCommentsController.handle(request, reply)
  );
  app.post('/portfolio/comments', (request, reply) =>
    createCommentController.handle(request, reply)
  );

  // Email route:
  app.post('/portfolio/send-email', (request, reply) =>
    sendEmailController.handle(request, reply)
  );

  // Files routes (specific paths registered before generic :fileName):
  app.post('/portfolio/files/upload', (request, reply) =>
    uploadFileController.handle(request, reply)
  );
  app.get('/portfolio/files', (request, reply) =>
    getFilesController.handle(request, reply)
  );
  app.get('/portfolio/files/:fileName/url', (request, reply) =>
    getFileUrlController.handle(request, reply)
  );
  app.get('/portfolio/files/:fileName/download', (request, reply) =>
    downloadFileController.handle(request, reply)
  );
  app.get('/portfolio/files/:fileName', (request, reply) =>
    getFileDataController.handle(request, reply)
  );
  app.delete('/portfolio/files/:fileName', (request, reply) =>
    deleteFileController.handle(request, reply)
  );

  return app;
}
