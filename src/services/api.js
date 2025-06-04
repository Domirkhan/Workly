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
  timeout: 10000
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
    // Очищаем все текущие уведомления
    showToast.dismiss();

    // Проверяем наличие ответа
    if (!response) {
      throw new Error(TOAST_MESSAGES.ERROR.NO_DATA);
    }

    // Проверяем и преобразуем данные
    let data = response.data;
    if (!data && response.status !== 204) {
      data = Array.isArray(response.config?.params) ? [] : {};
    }

    // Для методов изменяющих данные показываем уведомление об успехе
    if (['post', 'put', 'delete', 'patch'].includes(response.config.method)) {
      const successMessage = data?.message || TOAST_MESSAGES.SUCCESS.DEFAULT;
      showToast.success(successMessage);
    }

    // Если в ответе есть токен - сохраняем его
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }

    // Возвращаем данные
    return data;
  },
  (error) => {
    // Очищаем все текущие уведомления
    showToast.dismiss();

    // Логируем ошибку
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      error: error.message
    });

    // Обработка ошибки авторизации
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Обработка истекшей сессии
    if (error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Определяем текст ошибки
    const errorMessage = 
      error.response?.data?.message || // Сообщение от сервера
      error.message || // Сообщение из ошибки
      TOAST_MESSAGES.ERROR.DEFAULT; // Стандартное сообщение

    // Показываем уведомление об ошибке
    showToast.error(errorMessage);

    // Для сетевых ошибок
    if (!error.response) {
      showToast.error(TOAST_MESSAGES.ERROR.NETWORK);
    }

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