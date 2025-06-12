import Bonus from '../models/bonusModel.js';
import User from '../models/userModel.js';
import  sendEmail  from '../utils/sendEmail.js';

export const createBonus = async (req, res) => {
    try {
      console.log('Получены данные:', req.body);
      const { employeeId, type, amount, reason } = req.body;
      
      if (!employeeId || !type || !amount || !reason) {
        return res.status(400).json({ 
          message: 'Все поля обязательны для заполнения' 
        });
      }
  
      const employee = await User.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ message: 'Сотрудник не найден' });
      }
  
      console.log('Найден сотрудник:', employee);
  
      const bonus = new Bonus({
        employee: employeeId,
        type,
        amount,
        reason,
        createdBy: req.user.id
      });
  
      await bonus.save();
      console.log('Бонус сохранен:', bonus);
  
      try {
    console.log('Подготовка к отправке email...');
    const emailHtml = `
      <h2>Уведомление о ${type === 'bonus' ? 'премии' : 'штрафе'}</h2>
      <p>Уважаемый ${employee.name},</p>
      <p>Вам ${type === 'bonus' ? 'начислена премия' : 'назначен штраф'} в размере ${amount} тг.</p>
      <p><strong>Причина:</strong> ${reason}</p>
      <br>
      <p>С уважением,<br>Администрация WorklyApp</p>
    `;

    await sendEmail(
      employee.email,
      `${type === 'bonus' ? 'Премия' : 'Штраф'} - WorklyApp`,
      emailHtml
    );
    console.log('Email успешно отправлен на', employee.email);
  } catch (emailError) {
    console.error('Подробная ошибка отправки email:', {
      error: emailError.message,
      stack: emailError.stack,
      employee: employee.email
    });
  }

  res.status(201).json({ 
    ...bonus.toObject(), 
    emailSent: true 
  });
} catch (error) {
  console.error('Ошибка создания бонуса:', error);
  res.status(500).json({ 
    message: 'Внутренняя ошибка сервера',
    error: error.message 
  });
    }
  };

export const getEmployeeBonuses = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({ 
        message: 'Не указан ID сотрудника' 
      });
    }

    const bonuses = await Bonus.find({ 
      employee: employeeId 
    })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name')
    .lean();
    
    // Если записей нет, возвращаем пустой массив
    if (!bonuses || bonuses.length === 0) {
      return res.json([]);
    }
    
    res.json(bonuses);
  } catch (error) {
    console.error('Ошибка при получении бонусов:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении данных о бонусах',
      error: error.message 
    });
  }
};