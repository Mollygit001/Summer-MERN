/* eslint-disable no-undef */
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/authRoutes.js';
import mongoose from 'mongoose';
import linkRoutes from './src/routes/linkRoutes.js';
const app = express();
app.use(cookieParser());
app.use(express.json());

const corsconfig={
  origin: process.env.CLIENT_ENDPOINT,
  credentials: true,
}
app.use(cors(corsconfig));
app.use('/auth', authRoutes);
app.use('/links', linkRoutes);






mongoose.connect('mongodb://127.0.0.1:27017/mern-summer').then(() => {
  console.log('Connected to MongoDB');  
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const PORT = 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MERN Summer Auth API', version: '1.0.0',text:"Hello word" });
}); 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});