import axios from 'axios';
import { showToast } from './utils/toast';

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

export default axiosClient;