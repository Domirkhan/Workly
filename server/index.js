import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import timesheetRoutes from './routes/timesheetRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import bonusRoutes from './routes/bonusRoutes.js';

// Получаем путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем .env файл
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Добавьте localhost для разработки
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Явно указываем методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Разрешаем необходимые заголовки
}));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/timesheet', timesheetRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/bonuses', bonusRoutes);

app.use(express.static(path.join(__dirname, '..', 'dist')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Проверяем, что переменные окружения загружены
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);

// Тестовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// MongoDB подключение
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🚀 Подключено к MongoDB'))
  .catch((err) => console.error('❌ Ошибка подключения к MongoDB:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌐 Сервер запущен на порту ${PORT}`);
});

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Обработка всех остальных маршрутов
  app.get('*', (req, res) => {
    if (req.url.startsWith('/api')) {
      return; // Пропускаем API запросы
    }
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}