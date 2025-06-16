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
  getEmployeeMonthlyDetails
} from '../controllers/timesheetController.js';

const router = express.Router();

router.use(auth);

// Маршруты для сотрудника
router.get('/employee/stats', getEmployeeStats);
router.get('/employee/monthly', getEmployeeMonthlyRecords);
router.get('/employee/:employeeId/monthly', getEmployeeMonthlyDetails);

// Маршруты для отметки времени
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);

// Общие маршруты
router.get('/', getTimeRecords);
router.get('/monthly', getMonthlyTimeRecords);
router.get('/archive-months', getArchiveMonths);

export default router;