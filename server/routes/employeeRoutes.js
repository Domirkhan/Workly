import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { 
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  createEmployee
} from '../controllers/employeeController.js';

const router = express.Router();

router.use(auth); // Защищаем все маршруты

router.get('/', getEmployees);
router.get('/employee/:id', getEmployeeById);
router.post('/', createEmployee); // Новый маршрут для создания сотрудника
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;