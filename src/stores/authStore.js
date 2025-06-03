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
          const { user } = await api.auth.getMe();
          
          set({ 
            user: {
              ...user,
              hourlyRate: user?.hourlyRate || 0,
              position: user?.position || 'Не указана',
              status: user?.status || 'inactive'
            }, 
            isLoading: false
          });
          return user;
        } catch (error) {
          set({ user: null, isLoading: false, error: error.message });
          return null;
        }
      },

      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const { user } = await api.auth.login(credentials);
          set({ user, isLoading: false });
          toast.success(TOAST_MESSAGES.SUCCESS.LOGIN);
          return user;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          const { user } = await api.auth.register(userData);
          set({ user, isLoading: false });
          toast.success(TOAST_MESSAGES.SUCCESS.REGISTER);
          return user;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await api.auth.logout();
          set({ user: null, isLoading: false });
          localStorage.removeItem('auth-storage');
          toast.success(TOAST_MESSAGES.SUCCESS.LOGOUT);
          window.location.href = '/login';
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true });
          const { user } = await api.auth.updateProfile(userData);
          set(state => ({ 
            user: { ...state.user, ...user },
            isLoading: false 
          }));
          toast.success(TOAST_MESSAGES.SUCCESS.PROFILE_UPDATED);
          return user;
        } catch (error) {
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
      partialize: (state) => ({ user: state.user })
    }
  )
);

export default useAuthStore;