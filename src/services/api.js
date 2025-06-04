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
  timeout: 30000, // Увеличиваем таймаут до 30 секунд
  maxRetries: 3, // Максимальное количество повторных попыток
  retryDelay: 1000, // Задержка перед повторной попыткой
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
    showToast.dismiss();

    // Проверяем наличие ответа
    if (!response || !response.data) {
      console.warn('Пустой ответ от сервера');
      return Array.isArray(response?.config?.params) ? [] : {};
    }

    const data = response.data;

    // Для методов изменения данных
    if (['post', 'put', 'delete', 'patch'].includes(response.config?.method)) {
      const successMessage = data?.message || TOAST_MESSAGES.SUCCESS.DEFAULT;
      showToast.success(successMessage);
    }

    // Сохраняем токен
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  },
  (error) => {
    showToast.dismiss();

    // Логируем ошибку
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      error: error.message
    });

    // Обработка таймаута
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout:', error.config?.url);
      showToast.error('Превышено время ожидания ответа от сервера');
      return Promise.resolve([]);
    }

    // Обработка CORS ошибок
    if (error.message === 'Network Error') {
      showToast.error('Ошибка соединения с сервером');
      return Promise.resolve([]);
    }

    // Обработка 401/403 ошибок
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Обработка 404 ошибок
    if (error.response?.status === 404) {
      return Promise.resolve([]);
    }

    // Показываем ошибку пользователю
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        TOAST_MESSAGES.ERROR.DEFAULT;
    showToast.error(errorMessage);

    return Promise.resolve([]);
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