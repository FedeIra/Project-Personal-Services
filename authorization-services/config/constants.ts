import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET ?? 'default-secret-key',
  USER_DATA: {
    EMAIL: process.env.USER_EMAIL,
    PASSWORD: process.env.USER_PASSWORD,
  },
};
