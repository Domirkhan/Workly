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

// Настройка путей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка переменных окружения
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Инициализация приложения
const app = express();
const httpServer = createServer(app);

// Настройка Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.CLIENT_URL]
      : ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

configureSocket(io);

// Добавляем io в req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Логирование
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Парсинг данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));

// CORS настройки
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://workly-zd8z.onrender.com',
  'https://workly-backend.onrender.com',
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: function(origin, callback) {
    // Разрешаем запросы без origin (например, мобильные приложения)
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

// Предварительные запросы CORS
app.options('*', cors());

// API маршруты
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/timesheet', timesheetRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/bonuses', bonusRoutes);

// Раздача статических файлов
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  
  app.get('/*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:', err);
  
  // Отправляем детали ошибки только в development
  res.status(err.status || 500).json({ 
    message: err.message || 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Порт сервера
const PORT = process.env.PORT || 5000;

// Запуск сервера
const startServer = async () => {
  try {
    // Подключение к БД
    await connectDB();
    
    // Запуск сервера
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 Сервер запущен на порту ${PORT}
📝 Режим: ${process.env.NODE_ENV}
🔌 Socket.IO подключен
🌐 CORS разрешен для: ${allowedOrigins.join(', ')}
📦 База данных: Подключена
      `);
    });
    
    // Обработка ошибок
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

// Обработка необработанных исключений
process.on('unhandledRejection', (err) => {
  console.error('❌ Необработанное отклонение промиса:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('🛑 Получен сигнал SIGTERM. Закрытие сервера...');
  httpServer.close(() => {
    console.log('👋 Сервер закрыт');
    process.exit(0);
  });
});

// Запуск приложения
startServer();