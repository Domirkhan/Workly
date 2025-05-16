import { create } from 'zustand';
import { authApi } from '../services/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Ошибка сервера'
        }));
        throw new Error(errorData.message || 'Ошибка входа');
      }

      const data = await response.json();
      if (!data || !data.user) {
        throw new Error('Некорректный ответ от сервера');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isLoading: false });
      return data;
    } catch (error) {
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