import axios from 'axios';
import { showToast } from '../utils/toast';
import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '../../server/constants/toastMessages';

// Создаем инстанс axios с базовой конфигурацией
const axiosClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://workly-backend.onrender.com/api/v1'
    : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Перехватчик запросов
axiosClient.interceptors.request.use(
  (config) => {
    // Добавляем загрузочное уведомление для POST, PUT, DELETE запросов
    if (['post', 'put', 'delete'].includes(config.method)) {
      toast.loading('Загрузка...', {
        id: config.url
      });
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Перехватчик ответов
axiosClient.interceptors.response.use(
  (response) => {
    // Закрываем загрузочное уведомление и показываем успех
    if (['post', 'put', 'delete'].includes(response.config.method)) {
      toast.dismiss(response.config.url);
      toast.success('Операция выполнена успешно');
    }
    return response.data;
  },
  (error) => {
    // Закрываем загрузочное уведомление и показываем ошибку
    if (error.config) {
      toast.dismiss(error.config.url);
    }
    const message = error.response?.data?.message || TOAST_MESSAGES.ERROR.DEFAULT;
    toast.error(message);
    return Promise.reject(error);
  }
);

// Аутентификация
export const authApi = {
  register: (userData) => 
    axiosClient.post('/auth/register', userData),
  
  login: (credentials) =>
    axiosClient.post('/auth/login', credentials),
  
  logout: () =>
    axiosClient.post('/auth/logout'),
  
  getMe: () => 
    axiosClient.get('/auth/me'),
  
  updateProfile: (data) =>
    axiosClient.put('/auth/profile', data)
};

// Сотрудники
export const employeeApi = {
  getAll: () => 
    axiosClient.get('/employees'),
  
  getById: (id) => 
    axiosClient.get(`/employees/${id}`),
  
  create: (data) => 
    axiosClient.post('/employees', data),
  
  update: (id, data) => 
    axiosClient.put(`/employees/${id}`, data),
  
  delete: (id) => 
    axiosClient.delete(`/employees/${id}`),
  
  updateStatus: (id, status) => 
    axiosClient.patch(`/employees/${id}/status`, { status })
};

// Табель учета времени
export const timesheetApi = {
  clockIn: (data) =>
    axiosClient.post('/timesheet/clock-in', data),
  
  clockOut: (data) =>
    axiosClient.post('/timesheet/clock-out', data),
  
  getAll: () =>
    axiosClient.get('/timesheet'),
  
  getMonthly: (year, month) =>
    axiosClient.get('/timesheet/monthly', { params: { year, month } }),
  
  getEmployeeTimesheet: (employeeId, params) =>
    axiosClient.get(`/timesheet/employee/${employeeId}`, { params }),
  
  getArchiveMonths: () =>
    axiosClient.get('/timesheet/archive-months'),
    getEmployeeStats: (employeeId) =>
    axiosClient.get(`/timesheet/employee/${employeeId}/stats`),
  getEmployeeMonthlyDetails: (employeeId, params) =>
    axiosClient.get(`/timesheet/employee/${employeeId}/monthly`, { params }),

};

// Компания
export const companyApi = {
  generateQRCode: () =>  // было generateQrCode
    axiosClient.post('/company/qr-code'),
  
  getSettings: () =>
    axiosClient.get('/company/settings'),
  
  updateSettings: (data) =>
    axiosClient.put('/company/settings', data),
  
  generateInviteCode: () =>
    axiosClient.post('/company/invite-code'),

  validateQRCode: (qrCode) => 
    axiosClient.post('/company/validate-qr', { qrCode })
};

// Бонусы и штрафы
export const bonusApi = {
  create: (data) =>
    axiosClient.post('/bonuses', data),
  
  getEmployeeBonuses: (employeeId) =>
    axiosClient.get(`/bonuses/employee/${employeeId}`),
  
  getAll: () =>
    axiosClient.get('/bonuses'),
  
  update: (id, data) =>
    axiosClient.put(`/bonuses/${id}`, data),
  
  delete: (id) =>
    axiosClient.delete(`/bonuses/${id}`)
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