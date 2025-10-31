// External Dependencies:
import Fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import SQS from 'aws-sdk/clients/sqs';
import { S3 } from 'aws-sdk';

// Internal Dependencies:
import { ReportRequestRepository } from './infrastructure/repositories/DynamoRequestReportRepository';
import { CreateReportRequestController } from './infrastructure/controllers/CreateReportRequestController';
import { S3Repository } from './infrastructure/repositories/S3Repository';
import { SQSRepository } from './infrastructure/repositories/SQSRepository';
import { CreateReportRequestUseCase } from './application/usecases/CreateReportRequestUseCase';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  await app.register(multipart);

  const s3Repository = new S3Repository(
    new S3(),
    process.env.AWS_REPORTS_BUCKET!
  );
  const reportRequestRepository = new ReportRequestRepository();
  const sqsRepository = new SQSRepository(
    new SQS(),
    process.env.AWS_REPORT_REQUESTS_QUEUE_URL!
  );
  const useCase = new CreateReportRequestUseCase(
    s3Repository,
    reportRequestRepository,
    sqsRepository
  );
  const controller = new CreateReportRequestController(useCase);

  // Create report request:
  app.post('/reports/:email', async (request, reply) =>
    controller.handle(request, reply)
  );
  return app;
}
