import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { generateQRCode } from '../controllers/companyController.js';

const router = express.Router();

// Защищаем маршрут middleware аутентификации
router.post('/qr-code', auth, generateQRCode);

export default router;