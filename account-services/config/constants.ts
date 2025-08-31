import dotenv from 'dotenv';

dotenv.config();

type Environment = 'development' | 'production';
export const ENV: Environment =
  (process.env.NODE_ENV as Environment) || 'development';

export const CONFIG = {
  ENV,
  AWS: {
    ACCOUNT_ID: process.env.AWS_ACCOUNT_ID,
    ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION: process.env.AWS_REGION,
  },
  RESPONSE_MESSAGES: {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    PPI_REQUEST_FAILED: 'PPI request failed',
  },
  HTTP_STATUS_CODES: {
    OK: 200,
    BAD_REQUEST: 400,
    INTERNAL_SERVER_ERROR: 500,
  },
  USER_DATA: {
    EMAIL: process.env.USER_EMAIL,
  },
  ENCRYPTION: {
    KEY: process.env.ENCRYPTION_KEY || '',
    ALGORITHM: process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc',
    RANDOM_BYTES: Number(process.env.ENCRYPTION_RANDOM_BYTES) || 16,
  },
};
