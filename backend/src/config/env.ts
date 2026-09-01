import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crate_db?schema=public',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
