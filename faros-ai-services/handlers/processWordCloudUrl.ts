// Internal Dependencies:
import { IMessageHandler } from '../application/interfaces/IMessageHandler';
import {
  WordCloudProcessingRequest,
  ProcessorHandlerContext,
} from '../types/types';
import { UrlStatus } from '../domain/WordCloud';
import { CONFIG } from '../config/constants';

/**
 * SQS Message Handler: processes a single Amazon product URL.
 *
 * Flow:
 * 1. Check if URL is already PROCESSED (at-least-once delivery guard)
 * 2. Crawl Amazon page → extract product description (axios + cheerio)
 * 3. Tokenize text → word frequency map (stop word filtering)
 * 4. Atomically increment word counts in DynamoDB (ADD expression)
 * 5. Rebuild S3 cache with latest top words (pre-computed for fast GET)
 * 6. Mark URL as PROCESSED in DynamoDB
 */
export class ProcessWordCloudUrlHandler
  implements IMessageHandler<WordCloudProcessingRequest>
{
  public readonly type = 'word_cloud_url';

  constructor(private readonly ctx: ProcessorHandlerContext) {}

  async handle(payload: WordCloudProcessingRequest): Promise<void> {
    const { url } = payload;
    console.log(`[ProcessWordCloudUrlHandler] Processing URL: ${url}`);

    // 1. Guard against duplicate processing (at-least-once SQS delivery)
    const urlRecord = await this.ctx.processedUrlRepository.getUrlStatus(url);
    if (urlRecord && urlRecord.status === UrlStatus.PROCESSED) {
      console.log(
        `[ProcessWordCloudUrlHandler] URL already processed, skipping: ${url}`
      );
      return;
    }

    try {
      // 2. Crawl Amazon page and extract product description
      const description: string =
        await this.ctx.scraperService.extractProductDescription(url);

      if (!description || description.length === 0) {
        console.warn(
          `[ProcessWordCloudUrlHandler] Empty description for URL: ${url}`
        );
        await this.ctx.processedUrlRepository.markUrlAsError(url);
        return;
      }

      // 3. Tokenize text into word frequency map
      const wordCounts: Map<string, number> =
        this.ctx.wordTokenizerService.tokenize(description);

      console.log(
        `[ProcessWordCloudUrlHandler] Found ${wordCounts.size} unique words from: ${url}`
      );

      // 4. Atomically increment word counts in DynamoDB
      if (wordCounts.size > 0) {
        await this.ctx.wordCountRepository.incrementWordCounts(wordCounts);
      }

      // 5. Rebuild and update S3 cache with latest top words
      const topWords =
        await this.ctx.wordCountRepository.getAllWordCountsSorted(
          CONFIG.FAROS_WORDCLOUD_TOP_CACHE_SIZE
        );
      await this.ctx.wordCloudCacheRepository.updateCache(topWords);

      // 6. Mark URL as successfully processed
      await this.ctx.processedUrlRepository.markUrlAsProcessed(url);

      console.log(
        `[ProcessWordCloudUrlHandler] Successfully processed URL: ${url}`
      );
    } catch (error) {
      console.error(
        `[ProcessWordCloudUrlHandler] Error processing URL ${url}:`,
        error
      );
      await this.ctx.processedUrlRepository.markUrlAsError(url);
      throw error; // Re-throw to trigger SQS retry
    }
  }
}
