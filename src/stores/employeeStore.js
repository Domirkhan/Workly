import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { showToast } from '../utils/toast';

const API_URL = 'https://workly-backend.onrender.com/api/v1';

const fetchWithAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    mode: 'cors'
  });

  if (!response.ok) {
    const text = await response.text();
    let error;
    try {
      const data = JSON.parse(text);
      error = new Error(data.message || 'Произошла ошибка');
    } catch {
      error = new Error('Ошибка сервера');
    }
    throw error;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: [],
      isLoading: false,
      error: null,
      
      fetchEmployees: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchWithAuth('/employees');
          set({ employees: data, isLoading: false });
          return data;
        } catch (error) {
          console.error('Ошибка загрузки сотрудников:', error);
          set({ error: error.message, isLoading: false });
          showToast.error(`Ошибка: ${error.message}`);
          throw error;
        }
      },

      addEmployee: async (employeeData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchWithAuth('/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
          });
          
          set(state => ({
            employees: [...state.employees, data],
            isLoading: false
          }));
          
          showToast.success('Сотрудник успешно добавлен');
          return data;
        } catch (error) {
          console.error('Ошибка при добавлении сотрудника:', error);
          set({ error: error.message, isLoading: false });
          showToast.error(`Ошибка: ${error.message}`);
          throw error;
        }
      },
      
      updateEmployee: async (id, employeeData) => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchWithAuth(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(employeeData)
          });
          
          set(state => ({
            employees: state.employees.map(employee => 
              employee._id === id ? { ...employee, ...data } : employee
            ),
            isLoading: false
          }));
          
          showToast.success('Данные сотрудника обновлены');
          return data;
        } catch (error) {
          console.error('Ошибка при обновлении сотрудника:', error);
          set({ error: error.message, isLoading: false });
          showToast.error(`Ошибка: ${error.message}`);
          throw error;
        }
      },
      
      deleteEmployee: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await fetchWithAuth(`/employees/${id}`, {
            method: 'DELETE'
          });
          
          set(state => ({
            employees: state.employees.filter(employee => employee._id !== id),
            isLoading: false
          }));
          
          showToast.success('Сотрудник успешно удален');
        } catch (error) {
          console.error('Ошибка при удалении сотрудника:', error);
          set({ error: error.message, isLoading: false });
          showToast.error(`Ошибка: ${error.message}`);
          throw error;
        }
      },

      updateEmployeeStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchWithAuth(`/employees/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
          });
          
          set(state => ({
            employees: state.employees.map(employee => 
              employee._id === id ? { ...employee, status: data.status } : employee
            ),
            isLoading: false
          }));
          
          showToast.success('Статус сотрудника обновлен');
          return data;
        } catch (error) {
          console.error('Ошибка при обновлении статуса:', error);
          set({ error: error.message, isLoading: false });
          showToast.error(`Ошибка: ${error.message}`);
          throw error;
        }
      },

      getEmployeeById: (id) => {
        return get().employees.find(employee => employee._id === id) || null;
      },

      clearError: () => set({ error: null }),

      resetStore: () => {
        set({
          employees: [],
          isLoading: false,
          error: null
        });
        localStorage.removeItem('employee-storage');
      }
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({
        employees: state.employees
      })
    }
  )
);

export default useEmployeeStore;