const BASE_URL = 'https://workly-backend.onrender.com/api';

async function fetchWithAuth(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Что-то пошло не так');
  }

  return response.json();
}

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
};

export const companyApi = {
  generateInviteCode: () =>
    fetchWithAuth('/company/invite-code', {
      method: 'POST',
    }),

  generateQrCode: () =>
    fetchWithAuth('/company/qr-code', {
      method: 'GET',
    }),
};

export const timesheetApi = {
  clockIn: (data) =>
    fetchWithAuth('/timesheet/clock-in', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  clockOut: (data) =>
    fetchWithAuth('/timesheet/clock-out', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTimeRecords: () =>
    fetchWithAuth('/timesheet', {
      method: 'GET'
    }),
};
export const bonusApi = {
  createBonus: (bonusData) =>
    fetchWithAuth('/bonuses', {
      method: 'POST',
      body: JSON.stringify(bonusData),
    }),

  getEmployeeBonuses: (employeeId) =>
    fetchWithAuth(`/bonuses/employee/${employeeId}`, {
      method: 'GET',
    }),
};