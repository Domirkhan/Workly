import { create } from 'zustand';
import { format } from 'date-fns';
import { showToast } from '../utils/toast';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { TOAST_MESSAGES } from '../../server/constants/toastMessages';

export const useTimesheetStore = create((set, get) => ({
  records: [],
  isLoading: false,
  error: null,
  
  clockIn: async (employeeId, employeeName) => {
    try {
      const now = new Date();
      const loadingToast = toast.loading('Начинаем рабочий день...');
      
      // Добавляем вызов API
      const response = await api.timesheet.clockIn({
        employeeId,
        employeeName,
        date: format(now, 'yyyy-MM-dd'),
        clockIn: format(now, 'HH:mm')
      });

      const newRecord = {
        id: `record-${Math.random().toString(36).substring(2, 9)}`,
        employeeId,
        employeeName,
        date: format(now, 'yyyy-MM-dd'),
        clockIn: format(now, 'HH:mm'),
        clockOut: null,
        totalHours: null,
        calculatedPay: null,
      };
      
      set(state => ({
        records: [...state.records, newRecord]
      }));

      toast.dismiss(loadingToast);
      toast.success(TOAST_MESSAGES.SUCCESS.CLOCK_IN);
    } catch (error) {
      toast.error(TOAST_MESSAGES.ERROR.CLOCK_IN);
      console.error('Ошибка:', error);
    }
  },
  
  clockOut: async (recordId, hourlyRate) => {
    try {
      const now = new Date();
      const loadingToast = toast.loading('Завершаем рабочий день...');
      
      // Добавляем вызов API
      const response = await api.timesheet.clockOut({
        recordId,
        clockOut: format(now, 'HH:mm'),
        hourlyRate
      });
      
      set(state => ({
        records: state.records.map(record => {
          if (record.id === recordId) {
            const clockOutTime = format(now, 'HH:mm');
            
            // Расчет часов
            const [inHours, inMinutes] = record.clockIn.split(':').map(Number);
            const [outHours, outMinutes] = clockOutTime.split(':').map(Number);
            
            const totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
            const totalHours = +(totalMinutes / 60).toFixed(2);
            
            const calculatedPay = +(totalHours * hourlyRate).toFixed(2);
            
            return {
              ...record,
              clockOut: clockOutTime,
              totalHours,
              calculatedPay
            };
          }
          return record;
        })
      }));

      toast.dismiss(loadingToast);
      toast.success(TOAST_MESSAGES.SUCCESS.CLOCK_OUT);
    } catch (error) {
      toast.error(TOAST_MESSAGES.ERROR.CLOCK_OUT);
      console.error('Ошибка:', error);
    }
  },
  
  fetchEmployeeRecords: async (employeeId) => {
    const loadingToast = toast.loading('Загрузка данных...');
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.timesheet.getEmployeeTimesheet(employeeId);
      set({ records: response.data, isLoading: false });
      
      toast.dismiss(loadingToast);
      toast.success(TOAST_MESSAGES.SUCCESS.DATA_LOADED);
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(TOAST_MESSAGES.ERROR.DATA_LOAD);
    }
  },
  
  fetchAllRecords: async () => {
    const loadingToast = toast.loading('Загрузка данных...');
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.timesheet.getAll();
      set({ records: response.data, isLoading: false });
      
      toast.dismiss(loadingToast);
      toast.success(TOAST_MESSAGES.SUCCESS.DATA_LOADED);
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error(TOAST_MESSAGES.ERROR.DATA_LOAD);
    }
  },

  // Сброс состояния
  resetStore: () => {
    set({
      records: [],
      isLoading: false,
      error: null
    });
  }
}));

export default useTimesheetStore;