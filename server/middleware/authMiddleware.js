export const auth = async (req, res, next) => {
  try {
    // Добавляем CORS заголовки для OPTIONS запросов
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).json({});
    }

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

    // ... остальной код middleware
  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(401).json({ message: 'Ошибка аутентификации' });
  }
};