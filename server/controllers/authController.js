import User from '../models/userModel.js';
import Company from '../models/companyModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { TOAST_MESSAGES } from '../constants/toastMessages.js';

// Генерация JWT токена
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Регистрация
export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;
    
    // Валидация
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Пожалуйста, заполните все обязательные поля' 
      });
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Пожалуйста, введите корректный email' 
      });
    }

    // Проверка существующего пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    let user;
    let company;

    if (role === 'admin') {
      // Создаем компанию
      company = new Company({
        name: companyName || `Компания ${name}`,
        owner: null
      });
      await company.save();

      // Создаем админа
      user = new User({
        name,
        email,
        password,
        role,
        companyId: company._id,
        status: 'active',
        joinDate: new Date()
      });
      await user.save();

      // Обновляем владельца компании
      company.owner = user._id;
      await company.save();
    } else {
      // Создаем обычного пользователя
      user = new User({
        name,
        email,
        password,
        role,
        status: 'active',
        joinDate: new Date()
      });
      await user.save();
    }

    // Генерируем токен
    const token = generateToken(user._id);

    // Настраиваем cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        companyId: user.companyId,
        position: user.position,
        hourlyRate: user.hourlyRate,
        joinDate: user.joinDate
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      message: TOAST_MESSAGES.ERROR.DEFAULT
    });
  }
};

// Вход
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Пожалуйста, введите email и пароль' 
      });
    }

    // Поиск пользователя
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        message: 'Неверный email или пароль' 
      });
    }

    // Проверка пароля
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Неверный email или пароль' 
      });
    }

    // Генерация токена
    const token = generateToken(user._id);

    // Настройка cookie для production
    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Всегда true для HTTPS
      sameSite: 'none', // Для cross-site запросов
      domain: '.onrender.com', // Домен для продакшн
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
    });

    // Отправляем ответ с токеном и данными пользователя
    res.json({
      token, // Добавляем токен в ответ для сохранения в localStorage
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position || 'Не указана',
        hourlyRate: user.hourlyRate || 0,
        status: user.status || 'inactive',
        companyId: user.companyId,
        joinDate: user.joinDate
      },
      message: TOAST_MESSAGES.SUCCESS.LOGIN
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || TOAST_MESSAGES.ERROR.LOGIN
    });
  }
};

// Выход
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: TOAST_MESSAGES.SUCCESS.LOGOUT });
};

// Получение данных пользователя
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Ошибка получения данных:', error);
    res.status(500).json({ 
      message: TOAST_MESSAGES.ERROR.DEFAULT 
    });
  }
};

// Обновление профиля
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        message: 'Пользователь не найден' 
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ 
      message: TOAST_MESSAGES.ERROR.PROFILE_UPDATE 
    });
  }
};

export default {
  register,
  login,
  logout,
  getMe,
  updateProfile
};