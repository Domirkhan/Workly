import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: [],
      isLoading: false,
      error: null,

      fetchEmployees: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('https://workly-backend.onrender.com/api/v1/employees', {
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          const text = await response.text();
          let data;
          try {
            data = text ? JSON.parse(text) : [];
          } catch (e) {
            console.error('Ошибка парсинга JSON:', e);
            throw new Error('Некорректный ответ сервера');
          }

          if (!response.ok) {
            throw new Error(data.message || 'Не удалось загрузить сотрудников');
          }

          set({ employees: data, isLoading: false });
          return data;
        } catch (error) {
          console.error('Ошибка загрузки сотрудников:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      addEmployee: async (employeeData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('https://workly-backend.onrender.com/api/v1/employees', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(employeeData)
          });

          const text = await response.text();
          let data;
          try {
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            console.error('Ошибка парсинга JSON:', e);
            throw new Error('Некорректный ответ сервера');
          }

          if (!response.ok) {
            throw new Error(data.message || 'Ошибка при добавлении сотрудника');
          }

          set(state => ({
            employees: [...state.employees, data],
            isLoading: false
          }));

          return data;
        } catch (error) {
          console.error('Ошибка при добавлении сотрудника:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateEmployee: async (id, employeeData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`https://workly-backend.onrender.com/api/v1/employees/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(employeeData)
          });

          const text = await response.text();
          let data;
          try {
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            console.error('Ошибка парсинга JSON:', e);
            throw new Error('Некорректный ответ сервера');
          }

          if (!response.ok) {
            throw new Error(data.message || 'Ошибка при обновлении сотрудника');
          }

          set(state => ({
            employees: state.employees.map(employee =>
              employee._id === id ? { ...employee, ...data } : employee
            ),
            isLoading: false
          }));

          return data;
        } catch (error) {
          console.error('Ошибка при обновлении сотрудника:', error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteEmployee: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`https://workly-backend.onrender.com/api/v1/employees/${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          const text = await response.text();
          let data;
          try {
            data = text ? JSON.parse(text) : {};
          } catch (e) {
            // Если ответ пустой, это нормально для DELETE
            if (!text) {
              data = {};
            } else {
              console.error('Ошибка парсинга JSON:', e);
              throw new Error('Некорректный ответ сервера');
            }
          }

          if (!response.ok) {
            throw new Error(data.message || 'Ошибка при удалении сотрудника');
          }

          set(state => ({
            employees: state.employees.filter(employee => employee._id !== id),
            isLoading: false
          }));

          return data;
        } catch (error) {
          console.error('Ошибка при удалении сотрудника:', error);
          set({ error: error.message, isLoading: false });
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