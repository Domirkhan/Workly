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

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/employee/:employeeId/monthly', getEmployeeMonthlyDetails); // <-- OK
router.get('/employee/stats', getEmployeeStats);
router.get('/employee/monthly', getEmployeeMonthlyRecords);
router.get('/employee/archive-months', getEmployeeArchiveMonths);
router.get('/', getTimeRecords);
router.get('/all', getAllTimeRecords);
router.get('/monthly', getMonthlyTimeRecords);
router.get('/archive-months', getArchiveMonths);

export default router;