// External Dependencies:
import dotenv from 'dotenv';

// Internal Dependencies:
dotenv.config();

export const CONFIG = {
  IS_OFFLINE: process.env.IS_OFFLINE === 'true',
  FAROS_PROCESSED_URLS_TABLE:
    process.env.FAROS_PROCESSED_URLS_TABLE || 'FarosProcessedUrls',
  FAROS_WORD_COUNTS_TABLE:
    process.env.FAROS_WORD_COUNTS_TABLE || 'FarosWordCounts',
  FAROS_WORDCLOUD_QUEUE_URL: process.env.FAROS_WORDCLOUD_QUEUE_URL || '',
  FAROS_WORDCLOUD_CACHE_BUCKET:
    process.env.FAROS_WORDCLOUD_CACHE_BUCKET ||
    'dev-fedeira-personal-services-bucket',
  FAROS_WORDCLOUD_CACHE_KEY: 'wordcloud/cache/top-words.json',
  FAROS_WORDCLOUD_CACHE_TTL_MS: 60000, // 60 seconds in-memory cache TTL
  FAROS_WORDCLOUD_TOP_CACHE_SIZE: 1000, // Max words stored in S3 cache
  FAROS_WORD_COUNT_BATCH_SIZE: 25, // Parallel DynamoDB update batch size
};
