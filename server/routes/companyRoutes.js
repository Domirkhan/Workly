import express from 'express';
import { auth } from '../middleware/authMiddleware.js';
import { generateQRCode } from '../controllers/companyController.js';

const router = express.Router();

router.use(auth);

router.post('/qr-code', generateQRCode);

export default router;