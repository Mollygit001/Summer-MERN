/* eslint-disable no-undef */
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './src/routes/authRoutes.js';
import mongoose from 'mongoose';

console.log(process.env.MONGO_URI)
mongoose.connect('mongodb://127.0.0.1:27017/mern-summer').then(() => {
  console.log('Connected to MongoDB');  
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
const app = express();

app.use(express.json());

app.use(cookieParser());

const corsconfig={
  origin: process.env.CLIENT_ENDPOINT,
  credentials: true,
}

app.use(cors(corsconfig));


app.use('/auth', authRoutes);

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello, World!');
}); 

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});