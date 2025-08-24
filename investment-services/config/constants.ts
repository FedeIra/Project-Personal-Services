import dotenv from 'dotenv';
dotenv.config();

type Environment = 'development' | 'production';
export const ENV: Environment =
  (process.env.NODE_ENV as Environment) || 'development';

export const PPI_BASE_URL = {
  development: `${process.env.BASE_URL_PPI_TEST}/${process.env.API_VERSION_PPI}`,
  production: `${process.env.BASE_URL_PPI_PROD}/${process.env.API_VERSION_PPI}`,
};

const PPI_CREDENTIALS = {
  development: {
    CLIENT_KEY: process.env.CLIENT_KEY_PPI_TEST,
    API_KEY: process.env.API_KEY_PPI_TEST,
    API_SECRET: process.env.API_SECRET_PPI_TEST,
  },
  production: {
    CLIENT_KEY: process.env.CLIENT_KEY_PPI_PROD,
    API_KEY: process.env.API_KEY_PPI_PROD,
    API_SECRET: process.env.API_SECRET_PPI_PROD,
  },
};

export const CONFIG = {
  ENV,
  AWS: {
    ACCOUNT_ID: process.env.AWS_ACCOUNT_ID,
    ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION: process.env.AWS_REGION,
  },
  PPI: {
    BASE_URL: PPI_BASE_URL[ENV],
    ACCOUNT_NUMBER: process.env.ACCOUNT_NUMBER_PPI,
    AUTHORIZED_CLIENT: process.env.AUTHORIZED_CLIENT_PPI,
    CLIENT_KEY: PPI_CREDENTIALS[ENV].CLIENT_KEY,
    API_KEY: PPI_CREDENTIALS[ENV].API_KEY,
    API_SECRET: PPI_CREDENTIALS[ENV].API_SECRET,
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
};
