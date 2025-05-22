import express from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { auth } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/me', auth, getMe);

export default router;