// Internal Dependencies:
import { IProcessedUrlRepository } from '../application/interfaces/IProcessedUrlRepository';
import { IWordCountRepository } from '../application/interfaces/IWordCountRepository';
import { IWordCloudCacheRepository } from '../application/interfaces/IWordCloudCacheRepository';
import { IScraperService } from '../application/interfaces/IScraperService';
import { IWordTokenizerService } from '../application/interfaces/IWordTokenizerService';

export type Envelope<T = unknown> = {
  payload: T;
};

export type WordCloudProcessingRequest = {
  url: string;
  messageType: string;
};

export interface ProcessorHandlerContext {
  processedUrlRepository: IProcessedUrlRepository;
  wordCountRepository: IWordCountRepository;
  wordCloudCacheRepository: IWordCloudCacheRepository;
  scraperService: IScraperService;
  wordTokenizerService: IWordTokenizerService;
}
