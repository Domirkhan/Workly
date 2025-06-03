import { Server } from 'socket.io';

const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'https://workly-zd8z.onrender.com'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Обработка подключений
  io.on('connection', (socket) => {
    console.log(`👤 Пользователь подключен: ${socket.id}`);

    // Подключение к комнате компании
    socket.on('joinCompany', (companyId) => {
      socket.join(`company_${companyId}`);
      console.log(`👥 Пользователь ${socket.id} присоединился к компании ${companyId}`);
    });

    // Отметка времени
    socket.on('clockEvent', (data) => {
      const { companyId, employeeId, type, time } = data;
      io.to(`company_${companyId}`).emit('clockUpdate', {
        employeeId,
        type,
        time
      });
    });

    // Отключение
    socket.on('disconnect', () => {
      console.log(`👋 Пользователь отключен: ${socket.id}`);
    });
  });

  return io;
};

export default configureSocket;