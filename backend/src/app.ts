import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { ENV } from './config/env';

const app = express();

app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'AI Fitness Coach Service Operational' });
});

// API Routes
app.use('/api', routes);

// Central Error Handler
app.use(errorHandler);

export default app;
