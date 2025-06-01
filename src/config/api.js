export const apiConfig = {
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://workly-backend.onrender.com/api/v1'
    : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'include'
};