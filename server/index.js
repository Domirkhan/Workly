import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import morgan from 'morgan';
import colors from 'colors';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import timesheetRoutes from './routes/timesheetRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import bonusRoutes from './routes/bonusRoutes.js';
import connectDB from './config/db.js';

// Настройка путей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка переменных окружения
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// CORS настройки
const allowedOrigins = [
  'https://workly-zd8z.onrender.com',
  'https://workly-backend.onrender.com',
  'https://workly-h3jj.onrender.com'
];

// Инициализация приложения
const app = express();
const httpServer = createServer(app);

// Настройка Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  cookie: {
    name: 'io',
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  }
});

// Socket.IO соединения
io.on('connection', (socket) => {
  console.log('🔌 Пользователь подключен');

  socket.on('joinCompany', (companyId) => {
    socket.join(`company_${companyId}`);
    console.log(`👥 Подключение к комнате компании: ${companyId}`);
  });

  socket.on('disconnect', () => {
    console.log('👋 Пользователь отключен');
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(morgan('combined'));

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Запрос отклонен CORS от origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

app.options('*', cors());

// API маршруты
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/timesheet', timesheetRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/bonuses', bonusRoutes);

// Раздача статических файлов
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка:'.red, {
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(err.status || 500).json({ 
    message: err.message || 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Порт сервера
const PORT = process.env.PORT || 5000;

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('🛑 Получен сигнал завершения. Закрытие сервера...'.yellow);
  
  httpServer.close(() => {
    console.log('👋 HTTP сервер закрыт'.green);
    io.close(() => {
      console.log('👋 Socket.IO закрыт'.green);
      process.exit(0);
    });
  });

  // Принудительное закрытие через 10 секунд
  setTimeout(() => {
    console.error('⚠️ Принудительное закрытие'.red);
    process.exit(1);
  }, 10000);
};

// Обработчики сигналов
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('unhandledRejection', (err) => {
  console.error('❌ Необработанное отклонение промиса:'.red, err);
});

// Запуск сервера
const startServer = async () => {
  try {
    await connectDB();
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`
${'🚀 Сервер запущен на порту'.green} ${PORT.toString().cyan}
${'📝 Режим:'.yellow} ${process.env.NODE_ENV}
${'🔌 Socket.IO подключен'.blue}
${'🌐 CORS разрешен для:'.magenta} ${allowedOrigins.join(', ')}
${'📦 База данных:'.green} ${'Подключена'.cyan}
      `);
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:'.red, error);
    process.exit(1);
  }
};

startServer();