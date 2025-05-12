import { create } from 'zustand';
import { authApi } from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  error: null,

login: async (credentials) => {
  set({ isLoading: true, error: null });
  try {
    const res = await fetch(`${process.env.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });

    const data = await res.text(); // Сначала получаем текст ответа
    console.log('Server response:', data); // Отладочный вывод

    let jsonData;
    try {
      jsonData = JSON.parse(data); // Пытаемся распарсить JSON
    } catch (e) {
      throw new Error('Некорректный ответ сервера');
    }

    if (!res.ok) {
      throw new Error(jsonData.message || 'Ошибка авторизации');
    }

    localStorage.setItem('user', JSON.stringify(jsonData.user));
    set({ user: jsonData.user, isLoading: false });
    return jsonData;
  } catch (error) {
    console.error('Login error:', error);
    set({ error: error.message, isLoading: false });
    throw error;
  }
},

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.register(userData);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
      localStorage.removeItem('user');
      set({ user: null });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  },

  checkAuth: async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        set({ user: JSON.parse(storedUser) });
      }
    } catch (error) {
      console.error('Ошибка при проверке аутентификации:', error);
    }
  }
}));