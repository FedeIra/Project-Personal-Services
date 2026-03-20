// External Dependencies:
import * as cheerio from 'cheerio';

// Internal Dependencies:
import { IScraperService } from '../../application/interfaces/IScraperService';
import { axiosConfiguration } from '../../../common/utils/axiosConfiguration';

/**
 * Crawls Amazon product pages and extracts product description text.
 * Uses axios (with exponential retry from common config) + cheerio for HTML parsing.
 *
 * Amazon product descriptions are typically found in the #productDescription
 * section of the page. The scraper targets multiple possible selectors
 * as Amazon's HTML structure can vary between product types.
 */
export class AmazonScraperService implements IScraperService {
  // CSS selectors where Amazon product descriptions are commonly located
  private readonly descriptionSelectors: string[] = [
    '#productDescription',
    '#productDescription p',
    '#productDescription .a-section',
    '#feature-bullets',
    '#feature-bullets .a-list-item',
    '#aplus .aplus-v2',
    '.a-expander-content',
  ];

  private readonly browserHeaders = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
  };

  // Fetches Amazon homepage first to obtain session cookies, simulating a real browser visit
  private async getSessionCookies(): Promise<string> {
    try {
      const homeResponse = await axiosConfiguration.get(
        'https://www.amazon.com',
        {
          headers: { ...this.browserHeaders, 'Sec-Fetch-Site': 'none' },
          timeout: 15000,
        }
      );
      const setCookieHeader = homeResponse.headers['set-cookie'] as
        | string
        | string[]
        | undefined;
      if (!setCookieHeader) return '';
      return Array.isArray(setCookieHeader)
        ? setCookieHeader.map((c) => c.split(';')[0]).join('; ')
        : setCookieHeader.split(';')[0];
    } catch {
      return '';
    }
  }

  async extractProductDescription(url: string): Promise<string> {
    console.log(`[AmazonScraperService] Fetching URL: ${url}`);

    const cookies = await this.getSessionCookies();

    const response = await axiosConfiguration.get(url, {
      headers: {
        ...this.browserHeaders,
        'Sec-Fetch-Site': 'same-origin',
        Referer: 'https://www.amazon.com/',
        ...(cookies && { Cookie: cookies }),
      },
      timeout: 15000,
    });

    const html: string = response.data;
    const $ = cheerio.load(html);

    // Try each selector until we find description content
    let description = '';

    for (const selector of this.descriptionSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const text = element.text().trim();
        if (text.length > 20) {
          // Ignore very short matches (likely empty wrappers)
          description += ' ' + text;
        }
      }
    }

    description = description.trim();

    if (!description) {
      console.warn(
        `[AmazonScraperService] No product description found for URL: ${url}`
      );
      // Fallback: extract all text from the body (less precise but ensures we get something)
      description = $('body')
        .text()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000);
    }

    console.log(
      `[AmazonScraperService] Extracted ${description.length} characters from: ${url}`
    );

    return description;
  }
}
