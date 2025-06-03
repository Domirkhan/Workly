import axios from 'axios';
import { showToast } from '../utils/toast';

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
    return Promise.reject(error);
  }
);

// Перехватчик ответов
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || 'Произошла ошибка';
    showToast.error(message);
    return Promise.reject(error);
  }
);

export default axiosClient;