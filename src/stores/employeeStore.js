import { create } from 'zustand';
const BASE_URL = 'https://workly-backend.onrender.com/api';
export const useEmployeeStore = create((set) => ({
  employees: [],
  isLoading: false,
  error: null,
  
  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${BASE_URL}/employees`, {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error('Не удалось загрузить сотрудников');
      }
      const data = await res.json();
      set({ employees: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addEmployee: async (employee) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(employee)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Ошибка при добавлении сотрудника');
      }
      
      set(state => ({
        employees: [...state.employees, data],
        isLoading: false
      }));
      
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  updateEmployee: (id, data) => {
    set(state => ({
      employees: state.employees.map(employee => 
        employee.id === id ? { ...employee, ...data } : employee
      )
    }));
  },
  
  deleteEmployee: (id) => {
    set(state => ({
      employees: state.employees.filter(employee => employee.id !== id)
    }));
  },
}));