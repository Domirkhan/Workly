import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://workly-backend.onrender.com'
  : 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.companyId) return;

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true
    });

    // Подключаемся к комнате компании
    socketRef.current.emit('joinCompany', user.companyId);

    // Очистка при размонтировании
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user?.companyId]);

  const emitClockEvent = (type, time) => {
    if (socketRef.current && user?.companyId) {
      socketRef.current.emit('clockEvent', {
        companyId: user.companyId,
        employeeId: user.id,
        type,
        time
      });
    }
  };

  return {
    socket: socketRef.current,
    emitClockEvent
  };
};