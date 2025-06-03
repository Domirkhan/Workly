import axios from 'axios';
import { showToast } from '../utils/toast';
import { TOAST_MESSAGES } from '../constants/toastMessages';

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
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Перехватчик ответов
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || TOAST_MESSAGES.ERROR.DEFAULT;
    showToast.error(message);
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
    axiosClient.get('/timesheet/archive-months')
};

// Компания
export const companyApi = {
  generateQrCode: () =>
    axiosClient.post('/company/qr-code'),
  
  getSettings: () =>
    axiosClient.get('/company/settings'),
  
  updateSettings: (data) =>
    axiosClient.put('/company/settings', data),
  
  generateInviteCode: () =>
    axiosClient.post('/company/invite-code')
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