import { create } from 'zustand';
import { authApi } from '../services/api';

const BASE_URL = 'https://workly-backend.onrender.com/api';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ошибка авторизации');
      }

      const data = await res.json();
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isLoading: false });
    } catch (error) {
      console.error('Ошибка входа:', error);
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
      const res = await fetch(`${BASE_URL}/auth/check`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ user: data.user });
        return true;
      } else {
        localStorage.removeItem('user');
        set({ user: null });
        return false;
      }
    } catch (error) {
      console.error('Ошибка проверки аутентификации:', error);
      localStorage.removeItem('user');
      set({ user: null });
      return false;
    }
  }
}));