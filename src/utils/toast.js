import toast from 'react-hot-toast';

export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Вход выполнен успешно',
    LOGOUT: 'Выход выполнен успешно',
    REGISTER: 'Регистрация успешно завершена',
    DATA_LOADED: 'Данные успешно загружены',
    EMPLOYEE_ADDED: 'Сотрудник успешно добавлен',
    EMPLOYEE_UPDATED: 'Данные сотрудника обновлены',
    EMPLOYEE_DELETED: 'Сотрудник успешно удален',
    PROFILE_UPDATED: 'Профиль успешно обновлен',
    SETTINGS_UPDATED: 'Настройки обновлены',
    CLOCK_IN: 'Рабочий день начат',
    CLOCK_OUT: 'Рабочий день завершен',
    BONUS_ADDED: 'Премия начислена',
    PENALTY_ADDED: 'Штраф назначен',
    QR_GENERATED: 'QR-код сгенерирован'
  },
  ERROR: {
    DEFAULT: 'Произошла ошибка',
    LOGIN: 'Ошибка при входе',
    LOGOUT: 'Ошибка при выходе',
    REGISTER: 'Ошибка при регистрации',
    DATA_LOAD: 'Ошибка при загрузке данных',
    NETWORK: 'Ошибка сети',
    INVALID_QR: 'Недействительный QR-код',
    CLOCK_IN: 'Ошибка при начале рабочего дня',
    CLOCK_OUT: 'Ошибка при завершении рабочего дня',
    VALIDATION: 'Проверьте правильность заполнения полей',
    EMAIL: 'Ошибка отправки уведомления'
  }
};

export const showToast = {
  success: (message) => toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      maxWidth: '400px'
    }
  }),

  error: (message) => toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      maxWidth: '400px'
    }
  }),

  loading: (message) => toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#3B82F6',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      maxWidth: '400px'
    }
  }),

  custom: (message, type = 'default') => toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: type === 'warning' ? '⚠️' : 'ℹ️',
    style: {
      background: type === 'warning' ? '#F59E0B' : '#3B82F6',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      maxWidth: '400px'
    }
  }),

  dismiss: toast.dismiss
};

export default showToast;