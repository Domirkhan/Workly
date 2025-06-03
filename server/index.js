import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import timesheetRoutes from './routes/timesheetRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import bonusRoutes from './routes/bonusRoutes.js';
import connectDB from './config/db.js';
import configureSocket from './config/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const httpServer = createServer(app);

// Создаем экземпляр Socket.IO
const io = configureSocket(httpServer);

// Добавляем io в req для использования в роутах
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Логирование запросов
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.urlencoded({ extended: true }));

// CORS настройки
const allowedOrigins = [
  'https://workly-zd8z.onrender.com',
  'https://workly-backend.onrender.com',
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// Обработка OPTIONS запросов
app.options('*', cors());

// API маршруты
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/timesheet', timesheetRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/bonuses', bonusRoutes);

// Раздача статических файлов в production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:', err.stack);
  res.status(500).json({ 
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Подключаемся к базе данных
    await connectDB();
    
    // Запускаем сервер
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 Сервер запущен на порту ${PORT}
📝 Режим: ${process.env.NODE_ENV}
🔌 Socket.IO подключен
🌐 CORS разрешен для: ${allowedOrigins.join(', ')}
      `);
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

// Обработка необработанных исключений
process.on('unhandledRejection', (err) => {
  console.error('❌ Необработанное отклонение промиса:', err);
  // Даем время на логирование перед выходом
  process.exit(1);
});

startServer();