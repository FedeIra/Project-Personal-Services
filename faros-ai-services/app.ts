// External Dependencies:
import Fastify, { FastifyInstance } from 'fastify';
import SQS from 'aws-sdk/clients/sqs';
import { S3 } from 'aws-sdk';

// Internal Dependencies:
import { DynamoProcessedUrlRepository } from './infrastructure/repositories/DynamoProcessedUrlRepository';
import { S3WordCloudCacheRepository } from './infrastructure/repositories/S3WordCloudCacheRepository';
import { SQSRepository } from './infrastructure/repositories/SQSRepository';
import { SubmitUrlUseCase } from './application/usecases/SubmitUrlUseCase';
import { GetWordCloudUseCase } from './application/usecases/GetWordCloudUseCase';
import { SubmitUrlController } from './infrastructure/controllers/SubmitUrlController';
import { GetWordCloudController } from './infrastructure/controllers/GetWordCloudController';
import { CONFIG } from './config/constants';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  // DI: Instantiate repositories
  const processedUrlRepository = new DynamoProcessedUrlRepository();
  const s3 = new S3();
  const wordCloudCacheRepository = new S3WordCloudCacheRepository(
    s3,
    CONFIG.FAROS_WORDCLOUD_CACHE_BUCKET,
    CONFIG.FAROS_WORDCLOUD_CACHE_KEY
  );
  const sqsRepository = new SQSRepository(
    new SQS(),
    CONFIG.FAROS_WORDCLOUD_QUEUE_URL
  );

  // DI: Instantiate use cases
  const submitUrlUseCase = new SubmitUrlUseCase(
    processedUrlRepository,
    sqsRepository
  );
  const getWordCloudUseCase = new GetWordCloudUseCase(wordCloudCacheRepository);

  // DI: Instantiate controllers
  const submitUrlController = new SubmitUrlController(submitUrlUseCase);
  const getWordCloudController = new GetWordCloudController(
    getWordCloudUseCase
  );

  // Register routes
  app.get('/wordcloud', async (request, reply) =>
    getWordCloudController.handle(request, reply)
  );

  app.post('/wordcloud', async (request, reply) =>
    submitUrlController.handle(request, reply)
  );

  return app;
}
