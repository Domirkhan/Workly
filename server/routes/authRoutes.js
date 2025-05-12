import express from 'express';
import { login, register, logout, checkAuth } from '../controllers/authController.js';
import { auth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/check', auth, checkAuth);

export default router;