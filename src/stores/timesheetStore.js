import { create } from 'zustand';
import { format } from 'date-fns';
import { showToast } from '../utils/toast';
import { timesheetApi } from '../services/api';

export const useTimesheetStore = create((set, get) => ({
  records: [],
  isLoading: false,
  error: null,
  
  clockIn: async (employeeId, employeeName) => {
    try {
      const now = new Date();
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

      showToast.success('Рабочий день успешно начат');
    } catch (error) {
      showToast.error('Ошибка при начале рабочего дня');
      console.error('Ошибка:', error);
    }
  },
  
  clockOut: async (recordId, hourlyRate) => {
    try {
      const now = new Date();
      
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

      showToast.success('Рабочий день успешно завершен');
    } catch (error) {
      showToast.error('Ошибка при завершении рабочего дня');
      console.error('Ошибка:', error);
    }
  },
  
  fetchEmployeeRecords: async (employeeId) => {
    set({ isLoading: true, error: null });
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const filteredRecords = mockTimeRecords.filter(record => 
        record.employeeId === employeeId
      );
      
      set({ records: filteredRecords, isLoading: false });
      showToast.success('Данные успешно загружены');
    } catch (error) {
      set({ error: error.message, isLoading: false });
      showToast.error('Ошибка при загрузке данных');
    }
  },
  
  fetchAllRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ records: mockTimeRecords, isLoading: false });
      showToast.success('Данные успешно загружены');
    } catch (error) {
      set({ error: error.message, isLoading: false });
      showToast.error('Ошибка при загрузке данных');
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