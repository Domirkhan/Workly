import Bonus from '../models/bonusModel.js';
import User from '../models/userModel.js';
import  sendEmail  from '../utils/sendEmail.js';

export const createBonus = async (req, res) => {
  try {
    const { employeeId, type, amount, reason } = req.body;
    
    // Валидация
    if (!employeeId || !type || !amount || !reason) {
      return res.status(400).json({ 
        message: 'Все поля обязательны для заполнения' 
      });
    }

    // Поиск сотрудника
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    // Создание записи о бонусе/штрафе
    const bonus = new Bonus({
      employee: employeeId,
      type,
      amount,
      reason,
      createdBy: req.user.id
    });

    await bonus.save();

    // Отправка email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${type === 'bonus' ? '#10B981' : '#EF4444'}">
            Уведомление о ${type === 'bonus' ? 'премии' : 'штрафе'}
          </h2>
          <p>Уважаемый(ая) ${employee.name},</p>
          <p>Вам ${type === 'bonus' ? 'начислена премия' : 'назначен штраф'} 
             в размере <strong>${amount} тг</strong>.</p>
          <p><strong>Причина:</strong> ${reason}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            С уважением,<br>
            Команда WorklyApp
          </p>
        </div>
      `;

      await sendEmail(
        employee.email,
        `${type === 'bonus' ? 'Премия' : 'Штраф'} - WorklyApp`,
        emailHtml
      );

      console.log('Email успешно отправлен сотруднику:', employee.email);
    } catch (emailError) {
      console.error('Ошибка отправки email:', emailError);
      // Продолжаем выполнение даже если email не отправился
      // Но сохраняем информацию об ошибке
    }

    res.status(201).json({
      success: true,
      message: `${type === 'bonus' ? 'Премия начислена' : 'Штраф назначен'} успешно`,
      bonus
    });

  } catch (error) {
    console.error('Ошибка создания бонуса:', error);
    res.status(500).json({ 
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: error.message 
    });
  }
};

export const getEmployeeBonuses = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Проверяем валидность ID
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Неверный формат ID сотрудника' });
    }

    // Проверяем существование сотрудника
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    const bonuses = await Bonus.find({ employee: employeeId })
      .sort('-date')
      .populate('createdBy', 'name');
    
    res.json(bonuses);
  } catch (error) {
    console.error('Ошибка при получении бонусов:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении истории бонусов',
      error: error.message 
    });
  }
};