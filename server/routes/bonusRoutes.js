import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { 
  createBonus,
  getEmployeeBonuses
} from '../controllers/bonusController.js';

const router = express.Router();

router.use(auth); // Защищаем все маршруты

// Создание премии/штрафа
router.post('/', createBonus);

// Получение премий/штрафов сотрудника
router.get('/employee/:employeeId', getEmployeeBonuses);

export default router;