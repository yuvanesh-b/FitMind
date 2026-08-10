import app from './app';
import { ENV } from './config/env';
import { prisma } from './config/db';

const PORT = parseInt(ENV.PORT, 10) || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('[Database]: MySQL Prisma Client connected successfully.');

    app.listen(PORT, () => {
      console.log(`[Server]: AI Personal Fitness Coach Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Server Error]: Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
