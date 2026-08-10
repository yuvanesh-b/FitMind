import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_jwt_secret_fitness_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_jwt_refresh_secret_fitness_2026',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
