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
    showToast.dismiss();

    if (!response.data) {
      throw new Error(TOAST_MESSAGES.ERROR.NO_DATA);
    }

    if (['post', 'put', 'delete', 'patch'].includes(response.config.method)) {
      if (response.data?.message) {
        showToast.success(response.data.message);
      } else {
        showToast.success(TOAST_MESSAGES.SUCCESS.DEFAULT);
      }
    }

    return response.data;
  },
  (error) => {
    showToast.dismiss();

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        TOAST_MESSAGES.ERROR.DEFAULT;
    
    showToast.error(errorMessage);
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
  create: (data) => axiosClient.post('/bonuses', data),
  getEmployeeBonuses: (employeeId) => axiosClient.get(`/bonuses/employee/${employeeId}`),
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