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
  getEmployeeArchiveMonths
} from '../controllers/timesheetController.js';

const router = express.Router();

router.use(auth);

// Маршруты для отметки времени
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);

// Маршруты для сотрудника
router.get('/employee/stats', auth, getEmployeeStats); // Перемещаем выше
router.get('/employee/monthly', auth, getEmployeeMonthlyRecords);
router.get('/employee/archive-months', auth, getEmployeeArchiveMonths);

// Общие маршруты
router.get('/', getTimeRecords);
router.get('/all', getAllTimeRecords);
router.get('/monthly', getMonthlyTimeRecords);
router.get('/archive-months', getArchiveMonths);

export default router;