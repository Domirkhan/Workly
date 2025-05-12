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
        console.log('Email отправлен');
      } catch (emailError) {
        console.error('Ошибка отправки email:', emailError);
        // Продолжаем выполнение даже если email не отправился
      }
  
      res.status(201).json(bonus);
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
    const bonuses = await Bonus.find({ employee: req.params.employeeId })
      .sort('-date')
      .populate('createdBy', 'name');
    
    res.json(bonuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};