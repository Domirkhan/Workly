import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '../constants/toastMessages';

export const showToast = {
  success: (message) => toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#fff',
    }
  }),

  error: (message) => toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#fff',
    }
  }),

  loading: (message) => toast.loading(message, {
    position: 'top-right'
  }),

  custom: (message, type = 'default') => toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: type === 'warning' ? '⚠️' : 'ℹ️',
    style: {
      background: type === 'warning' ? '#F59E0B' : '#3B82F6',
      color: '#fff',
    }
  })
};

export default showToast;