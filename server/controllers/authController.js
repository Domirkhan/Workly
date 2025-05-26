import User from '../models/userModel.js';
import Company from '../models/companyModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Генерация JWT токена
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Регистрация
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Проверяем существование пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    
    let user;
    let company;
    
    if (role === 'admin') {
      // Создаём компанию для админа
      company = new Company({
        name: `Company of ${name}`,
      });
      
      // Создание админа
      user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        companyId: company._id
      });

      company.owner = user._id;
      await company.save();
    } else {
      // Создаём обычного пользователя без привязки к компании
      user = new User({
        name,
        email,
        password: hashedPassword,
        role
      });
    }

    await user.save();

    // Создание токена
    const token = generateToken(user._id);

res.cookie('token', token, {
  httpOnly: true,
  secure: true, // обязательно для https
  sameSite: 'None', // обязательно для кросс-доменных запросов на iOS/Safari
  maxAge: 30 * 24 * 60 * 60 * 1000
});

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Пожалуйста, введите email и пароль' 
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Неверный email или пароль' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Неверный email или пароль' 
      });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position, // Добавляем должность
        hourlyRate: user.hourlyRate, // Добавляем ставку
        status: user.status, // Добавляем статус
        joinDate: user.joinDate // Добавляем дату начала работы
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
// Выход
export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Выход выполнен успешно' });
};

// Также обновим getMe
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        hourlyRate: user.hourlyRate,
        status: user.status,
        joinDate: user.joinDate
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении пользователя' });
  }
};