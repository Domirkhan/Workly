import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Импортируем роуты
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import timesheetRoutes from './routes/timesheetRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import bonusRoutes from './routes/bonusRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS настройки
app.use(cors({
  origin: [
    'http://89.46.33.244',
    'http://localhost:5173',
    'https://workly-h3jj.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

// API routes (должны быть ПЕРЕД статическими файлами)
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/timesheet', timesheetRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/bonuses', bonusRoutes);

// Статические файлы и SPA routing
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  
  app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
    }
  });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🚀 Подключено к MongoDB'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Сервер запущен на порту ${PORT}`);
});