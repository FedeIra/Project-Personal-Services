export interface IScraperService {
  /**
   * Fetches an Amazon product page and extracts the product description text.
   * Combines HTTP fetching (axios + retry) and HTML parsing (cheerio).
   */
  extractProductDescription(url: string): Promise<string>;
}
