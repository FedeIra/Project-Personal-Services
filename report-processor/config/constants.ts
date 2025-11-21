import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET ?? 'default-secret-key',
  USER_DATA: {
    EMAIL: process.env.USER_EMAIL,
    PASSWORD: process.env.USER_PASSWORD,
  },
  IS_OFFLINE: process.env.IS_OFFLINE === 'true',
  REPORT_REQUESTS_TABLE: process.env.REPORT_REQUESTS_TABLE || '',
  AWS_REPORTS_BUCKET: process.env.AWS_REPORTS_BUCKET || '',
};
