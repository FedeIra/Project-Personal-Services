// Internal Dependencies:
import { ProcessedUrl } from '../../domain/WordCloud';

export interface IProcessedUrlRepository {
  /**
   * Attempts to insert URL with IN_PROGRESS status using conditional write.
   * Returns true if URL was inserted (first time), false if already exists (deduplication).
   */
  markUrlAsProcessing(url: string): Promise<boolean>;

  /**
   * Updates the URL status to PROCESSED after successful crawling.
   */
  markUrlAsProcessed(url: string): Promise<void>;

  /**
   * Updates the URL status to ERROR if crawling fails.
   */
  markUrlAsError(url: string): Promise<void>;

  /**
   * Gets the current status of a URL.
   */
  getUrlStatus(url: string): Promise<ProcessedUrl | null>;
}
