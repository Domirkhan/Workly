import User from '../models/userModel.js';
import Company from '../models/companyModel.js';
import mongoose from 'mongoose';

export const createEmployee = async (req, res) => {
  try {
    const { email, name, position, hourlyRate, status, joinDate } = req.body;
    
    // Получаем админа и его компанию
    const admin = await User.findById(req.user.id);
    if (!admin || !admin.companyId) {
      return res.status(400).json({ message: 'Компания не найдена' });
    }

    // Ищем пользователя по email
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email не зарегистрирован. Сначала пользователь должен создать аккаунт.' 
      });
    }

    // Проверяем не привязан ли уже пользователь к другой компании
    if (existingUser.companyId) {
      return res.status(400).json({ 
        message: 'Этот пользователь уже привязан к другой компании' 
      });
    }

    // Обновляем данные существующего пользователя
    const updates = {
      companyId: admin.companyId,
      position: position,
      hourlyRate: hourlyRate,
      status: status,
      joinDate: joinDate,
      role: 'employee' // Убедимся, что роль установлена как employee
    };

    // Используем findByIdAndUpdate вместо save()
    const updatedEmployee = await User.findByIdAndUpdate(
      existingUser._id,
      updates,
      { new: true }
    ).select('-password');

    // Добавляем сотрудника в компанию
    await Company.findByIdAndUpdate(
      admin.companyId,
      { $addToSet: { employees: updatedEmployee._id } } // Используем $addToSet вместо $push
    );
    
    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: error.message });
  }
};
// Получить всех сотрудников компании
export const getEmployees = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Фильтруем по companyId, а не company
    const employees = await User.find({ companyId: user.companyId })
      .select('-password');
    
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получить сотрудника по ID
export const getEmployeeById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Неверный идентификатор сотрудника' });
    }

    const employee = await User.findById(req.params.id).select('-password');
    
    if (!employee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }
    
    // Например, логируем joinDate, чтобы проверить его значение
    console.log('Fetched employee joinDate:', employee.joinDate);

    res.json(employee);
  } catch (error) {
    console.error('Error in getEmployeeById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Обновить данные сотрудника
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Неверный идентификатор сотрудника' });
    }
    
    // Обновляем только те поля, которые пришли в запросе
    const updates = req.body;
    
    const updatedEmployee = await User.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }
    
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Удалить сотрудника
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }
    
    // Удаляем сотрудника из списка компании, используя поле companyId из модели пользователя
    await Company.findByIdAndUpdate(
      employee.companyId,
      { $pull: { employees: employee._id } }
    );
    
    res.json({ message: 'Сотрудник успешно удален' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};