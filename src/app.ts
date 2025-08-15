import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';

// Load Environment Variables
dotenv.config();

const requiredEnvVars = ['PORT', 'PRO_MONGO_URI','DEV_MONGO_URI', 'JWT_SECRET'];

const missingVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingVars.length > 0) {
  console.error(
    ` Missing required environment variables: ${missingVars.join(', ')}`
  );
  process.exit(1);
}

// Handle Uncaught Errors Globally
process.on('uncaughtException', err => {
  console.error(' UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  console.error('UNHANDLED PROMISE REJECTION:', reason);
  process.exit(1);
});

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(' ERROR:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
