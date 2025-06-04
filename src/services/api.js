import axios from 'axios';
import { showToast } from '../utils/toast';
import { TOAST_MESSAGES } from '../../server/constants/toastMessages';

// Создаем инстанс axios с базовой конфигурацией
const axiosClient = axios.create({
  baseURL: 'https://workly-backend.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true,
  timeout: 10000,
  // Добавляем специальные настройки для CORS
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// Перехватчик запросов
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      showToast.loading(TOAST_MESSAGES.LOADING.DEFAULT);
    }
    return config;
  },
  (error) => {
    showToast.error(TOAST_MESSAGES.ERROR.NETWORK);
    return Promise.reject(error);
  }
);


// Перехватчик ответов
axiosClient.interceptors.response.use(
  (response) => {
    // Очищаем уведомления
    showToast.dismiss();

    // Проверяем и получаем данные
    const data = response?.data;

    // Если нет данных, возвращаем пустой массив/объект
    if (!data && response?.status !== 204) {
      console.warn('Нет данных в ответе');
      return Array.isArray(response?.config?.params) ? [] : {};
    }

    // Обрабатываем успешные запросы изменения данных
    if (['post', 'put', 'delete', 'patch'].includes(response?.config?.method)) {
      const successMessage = data?.message || TOAST_MESSAGES.SUCCESS.DEFAULT;
      showToast.success(successMessage);
    }

    // Сохраняем токен если есть
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }

    // Преобразуем данные перед возвратом
    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === 'object') {
      return data;
    } else {
      return {};
    }
  },
  (error) => {
    // Очищаем уведомления
    showToast.dismiss();

    // Логируем ошибку
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      error: error.message
    });

    // Обработка CORS ошибок
    if (error.message === 'Network Error' || error.message.includes('CORS')) {
      console.error('CORS Error:', error);
      showToast.error('Ошибка доступа к серверу. Пожалуйста, попробуйте позже.');
      return Promise.reject(new Error('CORS Error'));
    }

    // Обработка ошибок аутентификации
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Обработка 404 ошибок
    if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config?.url);
      return Promise.resolve([]);
    }

    // Обработка ошибок валидации (400)
    if (error.response?.status === 400) {
      const message = error.response.data?.message || 'Ошибка валидации данных';
      showToast.error(message);
      return Promise.reject(error);
    }

    // Обработка сетевых ошибок
    if (!error.response) {
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK);
      return Promise.resolve([]);
    }

    // Обработка серверных ошибок (500+)
    if (error.response?.status >= 500) {
      showToast.error('Ошибка сервера. Пожалуйста, попробуйте позже.');
      return Promise.reject(error);
    }

    // Показываем общую ошибку пользователю
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        TOAST_MESSAGES.ERROR.DEFAULT;
    showToast.error(errorMessage);

    // Логируем детали ошибки
    console.error('Request failed:', {
      config: error.config,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });

    return Promise.reject(error);
  }
);

// API для аутентификации
export const authApi = {
  register: (userData) => axiosClient.post('/auth/register', userData),
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  logout: () => axiosClient.post('/auth/logout'),
  getMe: () => axiosClient.get('/auth/me'),
  updateProfile: (data) => axiosClient.put('/auth/profile', data)
};

// API для работы с сотрудниками
export const employeeApi = {
  getAll: () => axiosClient.get('/employees'),
  getById: (id) => axiosClient.get(`/employees/${id}`),
  create: (data) => axiosClient.post('/employees', data),
  update: (id, data) => axiosClient.put(`/employees/${id}`, data),
  delete: (id) => axiosClient.delete(`/employees/${id}`),
  updateStatus: (id, status) => axiosClient.patch(`/employees/${id}/status`, { status })
};

// API для табеля учета времени
export const timesheetApi = {
  getAll: () => axiosClient.get('/timesheet'),
  getEmployeeTimesheet: (employeeId, params) => 
    axiosClient.get(`/timesheet/employee/${employeeId}`, { params }),
  getMonthly: (year, month) => 
    axiosClient.get('/timesheet/monthly', { params: { year, month } }),
  clockIn: (data) => axiosClient.post('/timesheet/clock-in', data),
  clockOut: (data) => axiosClient.post('/timesheet/clock-out', data),
  getArchiveMonths: () => axiosClient.get('/timesheet/archive-months'),
  getEmployeeStats: (employeeId) => 
    axiosClient.get(`/timesheet/employee/${employeeId}/stats`),
  getEmployeeMonthlyDetails: (employeeId, params) =>
    axiosClient.get(`/timesheet/employee/${employeeId}/monthly`, { params })
};

// API для работы с компанией
export const companyApi = {
  generateQRCode: () => axiosClient.post('/company/qr-code'),
  getSettings: () => axiosClient.get('/company/settings'),
  updateSettings: (data) => axiosClient.put('/company/settings', data),
  generateInviteCode: () => axiosClient.post('/company/invite-code'),
  validateQRCode: (qrCode) => axiosClient.post('/company/validate-qr', { qrCode })
};

// API для работы с бонусами
export const bonusApi = {
getEmployeeBonuses: () => axiosClient.get('/bonuses/employee/me'),
    create: (data) => axiosClient.post('/bonuses', data),
    getAll: () => axiosClient.get('/bonuses'),
    update: (id, data) => axiosClient.put(`/bonuses/${id}`, data),
    delete: (id) => axiosClient.delete(`/bonuses/${id}`)
};

// Единый объект API
export const api = {
  auth: authApi,
  employees: employeeApi,
  timesheet: timesheetApi,
  company: companyApi,
  bonus: bonusApi
};

export default api;