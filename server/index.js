import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';
import linkRoutes from './src/routes/linkRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';


const app = express();
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


app.use('/auth', authRoutes);
app.use('/links', linkRoutes);
app.use('/users', userRoutes);
app.use('/payments', paymentRoutes);

const PORT = process.env.SERVER_PORT || 5000;

app.listen(PORT, (error) => {
  if (error) {
    console.error('Error starting the server:', error);
    return;
  }
  console.log(`Server is running on http://localhost:${PORT}`);

  // Connect to MongoDB after server starts
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
});