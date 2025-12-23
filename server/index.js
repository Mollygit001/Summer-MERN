import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import 'dotenv/config';
import rateLimit from 'express-rate-limit';
import logger from './src/utilities/logger.js';
import authRoutes from './src/routes/authRoutes.js';
import linkRoutes from './src/routes/linkRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';


const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(cookieParser());

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/payments/webhook')) {
    return next();
  }
  express.json()(req, res, next);
})

const corsconfig = {
  origin: process.env.CLIENT_ENDPOINT,
  credentials: true,
}
app.use(cors(corsconfig));


import errorMiddleware from './src/middleware/errorMiddleware.js';

app.use('/auth', authRoutes);
app.use('/links', linkRoutes);
app.use('/users', userRoutes);
app.use('/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);


const PORT = process.env.SERVER_PORT || 5000;

const server = app.listen(PORT, (error) => {
  if (error) {
    logger.error('Error starting the server:', error);
    return;
  }
  logger.info(`Server is running on http://localhost:${PORT}`);

  // Connect to MongoDB after server starts
  mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => {
      logger.info('Connected to MongoDB');
    })
    .catch((err) => {
      logger.error('MongoDB connection error:', err);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close();
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close();
  });
});