import jwt from 'jsonwebtoken';

export const auth = async (req, res, next) => {
  try {
    let token;
    
    // Проверяем Authorization заголовок
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }
    
    // Если токен не найден в заголовке, проверяем cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (e) {
      return res.status(401).json({ message: 'Недействительный токен' });
    }
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(401).json({ message: 'Ошибка аутентификации' });
  }
};