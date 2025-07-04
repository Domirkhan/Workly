const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://workly-backend.onrender.com/api/v1'
  : '/api/v1';

async function fetchWithAuth(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      mode: 'cors'
    });

    // Проверяем тип контента
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Получен неверный формат ответа от сервера');
    }

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Требуется авторизация');
      }
      
      const error = await response.json();
      throw new Error(error.message || 'Произошла ошибка');
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Аутентификация
export const authApi = {
  register: (userData) => 
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  login: (credentials) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    fetchWithAuth('/auth/logout', {
      method: 'POST',
    }),
  getMe: () => 
    fetchWithAuth('/auth/me')
};

// Сотрудники
export const employeeApi = {
  getAll: () => 
    fetchWithAuth('/employees'),
  getById: (id) => 
    fetchWithAuth(`/employees/${id}`),
  create: (data) => 
    fetchWithAuth('/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  update: (id, data) => 
    fetchWithAuth(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id) => 
    fetchWithAuth(`/employees/${id}`, {
      method: 'DELETE'
    }),
  updateStatus: (id, status) => 
    fetchWithAuth(`/employees/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};

// Табель учета времени
export const timesheetApi = {
  clockIn: (data) =>
    fetchWithAuth('/timesheet/clock-in', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  clockOut: (data) =>
    fetchWithAuth('/timesheet/clock-out', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getAll: () =>
    fetchWithAuth('/timesheet'),
  getMonthly: (year, month) =>
    fetchWithAuth(`/timesheet/monthly?year=${year}&month=${month}`),
  getEmployeeTimesheet: (employeeId, params = {}) =>
    fetchWithAuth(`/timesheet/employee/${employeeId}${params ? `?${new URLSearchParams(params)}` : ''}`)
};

// Компания
export const companyApi = {
  generateInviteCode: () =>
    fetchWithAuth('/company/invite-code', {
      method: 'POST'
    }),
  generateQrCode: () =>
    fetchWithAuth('/company/qr-code', {
      method: 'POST'
    }),
  getSettings: () =>
    fetchWithAuth('/company/settings'),
  updateSettings: (data) =>
    fetchWithAuth('/company/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};

// Бонусы
export const bonusApi = {
  createBonus: (data) =>
    fetchWithAuth('/bonuses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getEmployeeBonuses: (employeeId) =>
    fetchWithAuth(`/bonuses/employee/${employeeId}`),
  getAll: () =>
    fetchWithAuth('/bonuses'),
  update: (id, data) =>
    fetchWithAuth(`/bonuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  delete: (id) =>
    fetchWithAuth(`/bonuses/${id}`, {
      method: 'DELETE'
    })
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