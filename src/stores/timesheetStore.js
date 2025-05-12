import { create } from 'zustand';
import { format } from 'date-fns';

// Mock data for demo


export const useTimesheetStore = create((set, get) => ({
  records: [],
  isLoading: false,
  error: null,
  
  clockIn: (employeeId, employeeName) => {
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
  },
  
  clockOut: (recordId, hourlyRate) => {
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
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchAllRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ records: mockTimeRecords, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));