// External Dependencies:
import { S3 } from 'aws-sdk';

// Internal Dependencies:
import {
  Envelope,
  WordCloudProcessingRequest,
  ProcessorHandlerContext,
} from './types/types';
import { ProcessWordCloudUrlHandler } from './handlers/processWordCloudUrl';
import { DynamoProcessedUrlRepository } from './infrastructure/repositories/DynamoProcessedUrlRepository';
import { DynamoWordCountRepository } from './infrastructure/repositories/DynamoWordCountRepository';
import { S3WordCloudCacheRepository } from './infrastructure/repositories/S3WordCloudCacheRepository';
import { AmazonScraperService } from './infrastructure/services/AmazonScraperService';
import { WordTokenizerService } from './infrastructure/services/WordTokenizerService';
import { IMessageHandler } from './application/interfaces/IMessageHandler';
import { CONFIG } from './config/constants';

export async function dispatch(
  envelope: Envelope<WordCloudProcessingRequest>,
  registry: Map<string, IMessageHandler<unknown>> = buildHandlersRegistry()
): Promise<void> {
  const { messageType } = envelope.payload;
  const handler: IMessageHandler<unknown> | undefined =
    registry.get(messageType);

  if (!handler) {
    throw new Error(`Unknown message type: ${messageType}`);
  }

  try {
    switch (messageType) {
      case 'word_cloud_url':
        await handler.handle(envelope.payload as WordCloudProcessingRequest);
        break;
      default:
        throw new Error(`No handler implemented for type: ${messageType}`);
    }
  } catch (error) {
    const enrichedError =
      error instanceof Error ? error : new Error(String(error));
    enrichedError.message = `Error processing message type=${messageType}: ${enrichedError.message}`;
    throw enrichedError;
  }
}

export function buildHandlersRegistry(): Map<string, IMessageHandler<unknown>> {
  // Initialize repositories and services
  const processedUrlRepository = new DynamoProcessedUrlRepository();
  const wordCountRepository = new DynamoWordCountRepository();
  const s3 = new S3();
  const wordCloudCacheRepository = new S3WordCloudCacheRepository(
    s3,
    CONFIG.FAROS_WORDCLOUD_CACHE_BUCKET,
    CONFIG.FAROS_WORDCLOUD_CACHE_KEY
  );
  const scraperService = new AmazonScraperService();
  const wordTokenizerService = new WordTokenizerService();

  // Create handler context with dependencies
  const handlerContext: ProcessorHandlerContext = {
    processedUrlRepository,
    wordCountRepository,
    wordCloudCacheRepository,
    scraperService,
    wordTokenizerService,
  };

  // Instantiate handlers
  const handlers: IMessageHandler[] = [
    new ProcessWordCloudUrlHandler(handlerContext),
  ];

  // Build handlers map by message type
  const registry = new Map<string, IMessageHandler>();
  handlers.forEach((handler) => {
    registry.set(handler.type, handler);
  });

  return registry;
}
