import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { showToast } from '../utils/toast';

const SOCKET_URL = 'https://workly-backend.onrender.com';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { user } = useAuthStore();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!user?.companyId) return;

    try {
      socketRef.current = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: {
          token: localStorage.getItem('token')
        },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socketRef.current.on('connect', () => {
        console.log('🔌 Подключено к Socket.IO');
        reconnectAttempts.current = 0;
        socketRef.current.emit('joinCompany', user.companyId);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Ошибка подключения Socket.IO:', error);
        reconnectAttempts.current++;
        
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          showToast.error('Не удалось подключиться к серверу');
          socketRef.current.disconnect();
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    } catch (error) {
      console.error('Ошибка инициализации Socket.IO:', error);
      showToast.error('Ошибка подключения к серверу');
    }
  }, [user?.companyId]);

  return {
    socket: socketRef.current,
    emitClockEvent: (type, time) => {
      if (socketRef.current?.connected && user?.companyId) {
        socketRef.current.emit('clockEvent', {
          companyId: user.companyId,
          employeeId: user.id,
          type,
          time
        });
      }
    }
  };
};