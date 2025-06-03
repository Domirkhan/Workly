import axiosClient from './axiosClient';

// Аутентификация
export const authApi = {
  register: (userData) => 
    axiosClient.post('/auth/register', userData),
  login: (credentials) =>
    axiosClient.post('/auth/login', credentials),
  logout: () =>
    axiosClient.post('/auth/logout'),
  getMe: () => 
    axiosClient.get('/auth/me')
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
    axiosClient.get(`/timesheet/monthly?year=${year}&month=${month}`)
};

// Компания 
export const companyApi = {
  generateQrCode: () =>
    axiosClient.post('/company/qr-code'),
  getSettings: () =>
    axiosClient.get('/company/settings'),
  updateSettings: (data) =>
    axiosClient.put('/company/settings', data)
};