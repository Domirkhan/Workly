import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (!response.ok) {
            if (response.status === 401) {
              set({ user: null, isLoading: false });
              return null;
            }
            throw new Error('Ошибка авторизации');
          }

          const data = await response.json();
          set({ 
            user: {
              ...data.user,
              hourlyRate: data.user.hourlyRate || 0,
              position: data.user.position || 'Не указана',
              status: data.user.status || 'inactive'
            }, 
            isLoading: false 
          });
          return data.user;
        } catch (error) {
          console.error('Ошибка проверки авторизации:', error);
          set({ user: null, isLoading: false, error: error.message });
          return null;
        }
      },

      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(credentials)
          });

          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Неверный email или пароль');
          }

          set({ user: data.user, isLoading: false });
          return data.user;
        } catch (error) {
          console.error('Ошибка входа:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Ошибка при регистрации');
          }

          set({ user: data.user, isLoading: false });
          return data.user;
        } catch (error) {
          console.error('Ошибка регистрации:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Ошибка при выходе');
          }

          set({ user: null, error: null });
          localStorage.removeItem('auth-storage');
        } catch (error) {
          console.error('Ошибка при выходе:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Ошибка обновления профиля');
          }

          set(state => ({
            user: { ...state.user, ...data.user },
            isLoading: false
          }));

          return data.user;
        } catch (error) {
          console.error('Ошибка обновления профиля:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      resetAuth: () => {
        set({ user: null, isLoading: false, error: null });
        localStorage.removeItem('auth-storage');
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user
      })
    }
  )
);

export default useAuthStore;