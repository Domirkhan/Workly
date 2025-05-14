import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import {
  clockIn,
  clockOut,
  getTimeRecords,
  getAllTimeRecords,
  getMonthlyTimeRecords,
  getArchiveMonths,
  getEmployeeStats,
  getEmployeeMonthlyRecords,
  getEmployeeArchiveMonths,
  getEmployeeMonthlyDetails // Добавьте этот импорт
} from '../controllers/timesheetController.js';

const router = express.Router();

router.use(auth);

// Маршруты для отметки времени
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);

// Маршруты для получения деталей сотрудника
router.get('/employee/:employeeId/monthly', getEmployeeMonthlyDetails); // Добавьте этот маршрут

// Маршруты для сотрудника
router.get('/employee/stats', getEmployeeStats);
router.get('/employee/monthly', getEmployeeMonthlyRecords);
router.get('/employee/archive-months', getEmployeeArchiveMonths);

// Общие маршруты
router.get('/', getTimeRecords);
router.get('/all', getAllTimeRecords);
router.get('/monthly', getMonthlyTimeRecords);
router.get('/archive-months', getArchiveMonths);

export default router;