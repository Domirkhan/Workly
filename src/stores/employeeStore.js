import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '../../server/constants/toastMessages';

export const useEmployeeStore = create(
  persist(
    (set, get) => ({
      employees: [],
      isLoading: false,
      error: null,
      
      fetchEmployees: async () => {
        try {
          set({ isLoading: true });
          const data = await api.employees.getAll();
          set({ employees: data, isLoading: false });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      addEmployee: async (employeeData) => {
        try {
          set({ isLoading: true });
          const employee = await api.employees.create(employeeData);
          set(state => ({
            employees: [...state.employees, employee],
            isLoading: false
          }));
          toast.success(TOAST_MESSAGES.SUCCESS.EMPLOYEE_ADDED);
          return employee;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateEmployee: async (id, employeeData) => {
        try {
          set({ isLoading: true });
          const updated = await api.employees.update(id, employeeData);
          set(state => ({
            employees: state.employees.map(emp => 
              emp._id === id ? { ...emp, ...updated } : emp
            ),
            isLoading: false
          }));
          toast.success(TOAST_MESSAGES.SUCCESS.EMPLOYEE_UPDATED);
          return updated;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteEmployee: async (id) => {
        try {
          set({ isLoading: true });
          await api.employees.delete(id);
          set(state => ({
            employees: state.employees.filter(emp => emp._id !== id),
            isLoading: false
          }));
          toast.success(TOAST_MESSAGES.SUCCESS.EMPLOYEE_DELETED);
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateEmployeeStatus: async (id, status) => {
        try {
          set({ isLoading: true });
          const updated = await api.employees.updateStatus(id, status);
          set(state => ({
            employees: state.employees.map(emp =>
              emp._id === id ? { ...emp, status: updated.status } : emp
            ),
            isLoading: false
          }));
          toast.success(TOAST_MESSAGES.SUCCESS.EMPLOYEE_UPDATED);
          return updated;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      getEmployeeById: (id) => {
        return get().employees.find(emp => emp._id === id) || null;
      },

      clearError: () => set({ error: null }),

      resetStore: () => {
        set({ employees: [], isLoading: false, error: null });
        localStorage.removeItem('employee-storage');
      }
    }),
    {
      name: 'employee-storage',
      partialize: (state) => ({ employees: state.employees })
    }
  )
);

export default useEmployeeStore;