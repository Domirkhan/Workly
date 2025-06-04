import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '../../server/constants/toastMessages';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      checkAuth: async () => {
  try {
    set({ isLoading: true, error: null });
    
    // Проверяем наличие токена
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, isLoading: false });
      return null;
    }

    const response = await api.auth.getMe();
    
    // Проверяем наличие данных пользователя
    if (!response?.user) {
      throw new Error('Ошибка получения данных пользователя');
    }

    const user = response.user;

    // Устанавливаем данные пользователя в store
    set({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        position: user.position || 'Не указана',
        hourlyRate: user.hourlyRate || 0,
        status: user.status || 'inactive',
        joinDate: user.joinDate
      },
      isLoading: false,
      error: null
    });

    return user;

  } catch (error) {
    console.error('Ошибка проверки авторизации:', error);
    
    // Очищаем данные при ошибке
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
    
    set({ 
      user: null, 
      isLoading: false, 
      error: error.response?.data?.message || error.message 
    });

    // Перенаправляем на страницу входа при ошибке авторизации
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }

    return null;
  }
},

      login: async (credentials) => {
  try {
    set({ isLoading: true, error: null });
    
    const response = await api.auth.login(credentials);
    
    // Проверяем наличие ответа
    if (!response) {
      throw new Error('Нет ответа от сервера');
    }

    // Извлекаем данные из ответа
    const { token, user } = response;

    // Проверяем наличие обязательных данных
    if (!token || !user || !user.id) {
      throw new Error('Неверный формат ответа от сервера');
    }

    // Сохраняем токен
    localStorage.setItem('token', token);

    // Обновляем состояние с проверкой полей
    set({ 
      user: {
        id: user.id,
        name: user.name || 'Без имени',
        email: user.email,
        role: user.role || 'employee',
        companyId: user.companyId,
        position: user.position || 'Не указана',
        hourlyRate: user.hourlyRate || 0,
        status: user.status || 'inactive',
        joinDate: user.joinDate || new Date()
      },
      isLoading: false,
      error: null
    });

    // Показываем уведомление об успехе
    toast.success(TOAST_MESSAGES.SUCCESS.LOGIN);

    return { user, token };

  } catch (error) {
    // Очищаем данные при ошибке
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
    
    set({ 
      user: null, 
      isLoading: false, 
      error: error.message || 'Ошибка при входе'
    });

    // Показываем ошибку
    toast.error(error.message || TOAST_MESSAGES.ERROR.LOGIN);
    
    throw error;
  }
},

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.auth.register(userData);
          const { user, token } = response.data;

          if (token) {
            localStorage.setItem('token', token);
          }

          set({ 
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              companyId: user.companyId,
              position: user.position || 'Не указана',
              hourlyRate: user.hourlyRate || 0,
              status: user.status || 'inactive',
              joinDate: user.joinDate
            }, 
            isLoading: false 
          });
          
          toast.success(TOAST_MESSAGES.SUCCESS.REGISTER);
          return user;
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false });
          toast.error(error.response?.data?.message || TOAST_MESSAGES.ERROR.REGISTER);
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await api.auth.logout();
          
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
          
          set({ user: null, isLoading: false, error: null });
          toast.success(TOAST_MESSAGES.SUCCESS.LOGOUT);
          
          window.location.href = '/login';
        } catch (error) {
          console.error('Ошибка при выходе:', error);
          set({ error: error.message, isLoading: false });
          toast.error(TOAST_MESSAGES.ERROR.LOGOUT);
        }
      },

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true });
          const response = await api.auth.updateProfile(userData);
          
          if (response?.data?.user) {
            const updatedUser = response.data.user;
            set(state => ({ 
              user: {
                ...state.user,
                ...updatedUser,
                position: updatedUser.position || state.user.position,
                hourlyRate: updatedUser.hourlyRate || state.user.hourlyRate
              },
              isLoading: false 
            }));
            toast.success(TOAST_MESSAGES.SUCCESS.PROFILE_UPDATED);
            return updatedUser;
          }
          throw new Error('Ошибка обновления профиля');
        } catch (error) {
          set({ error: error.response?.data?.message || error.message, isLoading: false });
          toast.error(TOAST_MESSAGES.ERROR.PROFILE_UPDATE);
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      
      resetAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        set({ user: null, isLoading: false, error: null });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user })
    }
  )
);

export default useAuthStore;