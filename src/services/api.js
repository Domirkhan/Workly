import axios from 'axios';
import { showToast } from '../utils/toast';
import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '../../server/constants/toastMessages';

// Создаем инстанс axios с базовой конфигурацией
const axiosClient = axios.create({
  baseURL: 'https://workly-backend.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Перехватчик запросов
axiosClient.interceptors.request.use(
  (config) => {
    if (['post', 'put', 'delete'].includes(config.method)) {
      showToast.loading('Загрузка...');
    }
    return config;
  },
  (error) => {
    showToast.error('Ошибка при отправке запроса');
    return Promise.reject(error);
  }
);

// Перехватчик ответов
axiosClient.interceptors.response.use(
  (response) => {
    // Проверяем наличие данных
    if (!response.data) {
      throw new Error('Нет данных в ответе');
    }
    
    // Для методов, которые изменяют данные
    if (['post', 'put', 'delete'].includes(response.config.method)) {
      showToast.dismiss();
      showToast.success('Операция выполнена успешно');
    }
    
    return response.data;
  },
  (error) => {
    showToast.dismiss();
    
    // Обработка различных типов ошибок
    if (error.response) {
      // Ошибка от сервера
      const message = error.response.data?.message || 'Ошибка сервера';
      showToast.error(message);
    } else if (error.request) {
      // Нет ответа от сервера
      showToast.error('Нет ответа от сервера');
    } else {
      // Ошибка при настройке запроса
      showToast.error('Ошибка при выполнении запроса');
    }
    
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
  getAll: async () => {
      const response = await axiosClient.get('/timesheet');
      return {
        data: Array.isArray(response.data) ? response.data : []
      };
    },

    getEmployeeTimesheet: async (employeeId, params) => {
      const response = await axiosClient.get(`/timesheet/employee/${employeeId}`, { params });
      return {
        data: Array.isArray(response?.records) ? response.records : []
      };
    },

    getMonthly: async (year, month) => {
      const response = await axiosClient.get('/timesheet/monthly', { params: { year, month } });
      return Array.isArray(response) ? response : [];
    },

    clockIn: (data) => axiosClient.post('/timesheet/clock-in', data),
    clockOut: (data) => axiosClient.post('/timesheet/clock-out', data),
  
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