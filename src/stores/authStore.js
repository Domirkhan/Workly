import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
      (set, get) => ({
      user: null,
      isAuthChecking: false, // Для проверки авторизации
      isLoginLoading: false, // Для входа
      isRegisterLoading: false, // Для регистрации
      error: null,


checkAuth: async () => {
  try {
    set({ iisAuthChecking: true, error: null });
    const response = await fetch('https://workly-backend.onrender.com/api/v1/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
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
    set({ user: null, isLoading: false });
    return null;
  }
},

login: async (credentials) => {
  try {
    set({ isLoading: true, error: null });
    const response = await fetch('https://workly-backend.onrender.com/api/v1/auth/login', {
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

      // Метод для регистрации
      register: async (userData) => {
  try {
    set({ isRegisterLoading: true, error: null });
    const response = await fetch('https://workly-backend.onrender.com/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    // Добавляем проверку на пустой ответ
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка регистрации');
    }

    set({ user: data.user, isRegisterLoading: false });
    return data.user;
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    set({ error: error.message, isRegisterLoading: false });
    throw error;
  }
},

      // Метод для выхода
      logout: async () => {
        try {
          const response = await fetch('https://workly-backend.onrender.com/api/v1/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
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
          set({ error: error.message });
          throw error;
        }
      },

      // Метод для обновления профиля
      updateProfile: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch('https://workly-backend.onrender.com/api/v1/auth/profile', {
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

      // Вспомогательные методы
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