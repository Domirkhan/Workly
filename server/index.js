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


// Добавляем эти строки для получения __dirname в ES модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Обновленные настройки CORS
app.use(cors({
  origin: ['http://89.46.33.244', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/timesheet', timesheetRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/bonuses', bonusRoutes);

// Handle SPA routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🚀 Подключено к MongoDB'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 Сервер запущен на порту ${PORT}`);
});