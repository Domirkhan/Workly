import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = 'https://workly-backend.onrender.com/api/v1';

const fetchWithAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    mode: 'cors'
  });

  if (!response.ok) {
    const text = await response.text();
    let error;
    try {
      const data = JSON.parse(text);
      error = new Error(data.message || 'Произошла ошибка');
    } catch {
      error = new Error('Ошибка сервера');
    }
    throw error;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const data = await fetchWithAuth('/auth/me', {
            method: 'GET'
          });

          set({ 
            user: {
              ...data.user,
              hourlyRate: data.user?.hourlyRate || 0,
              position: data.user?.position || 'Не указана',
              status: data.user?.status || 'inactive'
            }, 
            isLoading: false,
            error: null
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
          const data = await fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
          });

          set({ user: data.user, isLoading: false, error: null });
          showToast.success('Вход выполнен успешно');
          return data.user;
        } catch (error) {
          showToast.error(error.message);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const data = await fetchWithAuth('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
          });

          set({ 
            user: data.user, 
            isLoading: false, 
            error: null 
          });
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
    
    await fetchWithAuth('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });

    // Очищаем данные пользователя
    set({ 
      user: null, 
      error: null, 
      isLoading: false 
    });

    // Очищаем локальное хранилище
    localStorage.removeItem('auth-storage');
    
    // Показываем уведомление об успешном выходе
    showToast.success('Вы успешно вышли из системы');

    // Опционально: редирект на страницу входа
    window.location.href = '/login';
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    set({ 
      error: error.message, 
      isLoading: false 
    });
    showToast.error('Ошибка при выходе: ' + error.message);
  }
},

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const data = await fetchWithAuth('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
          });

          set(state => ({
            user: { ...state.user, ...data.user },
            isLoading: false,
            error: null
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