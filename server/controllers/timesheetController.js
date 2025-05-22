import User from '../models/userModel.js';
import TimeRecord from '../models/timeRecordModel.js';
import Company from '../models/companyModel.js';
import { format } from 'date-fns'; // Добавляем импорт format
import mongoose from 'mongoose'; // Импортируем mongoose для работы с ObjectId
// Отметить начало работы
export const clockIn = async (req, res) => {
  try {
    const { qrCode } = req.body;
    console.log('Полученный QR-код:', qrCode);
    
    const employee = await User.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    // Проверяем QR-код компании
    const company = await Company.findById(employee.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Компания не найдена' });
    }

    // Проверяем валидность QR-кода
    if (!company.isQRCodeValid() || company.qrCode !== qrCode) {
      return res.status(400).json({ message: 'Недействительный QR-код' });
    }

    // Создаем новую запись
    const timeRecord = new TimeRecord({
      employee: employee._id,
      company: company._id,
      date: new Date(),
      clockIn: new Date(),
      status: 'active'
    });

    await timeRecord.save();
    console.log('Создана новая запись:', timeRecord);

    res.status(201).json(timeRecord);
  } catch (error) {
    console.error('Ошибка при создании записи:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании записи' });
  }
};

// Отметить конец работы
export const clockOut = async (req, res) => {
  try {
    const { qrCode } = req.body;
    const employee = await User.findById(req.user.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    const company = await Company.findById(employee.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Компания не найдена' });
    }

    if (!company.isQRCodeValid() || company.qrCode !== qrCode) {
      return res.status(400).json({ message: 'Недействительный QR-код' });
    }

    // Ищем активную запись
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeRecord = await TimeRecord.findOne({
      employee: employee._id,
      status: 'active',
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!activeRecord) {
      return res.status(400).json({ message: 'Нет активной записи для завершения' });
    }

    // Обновляем запись
    activeRecord.clockOut = new Date();
    activeRecord.status = 'completed';

    // Рассчитываем часы и оплату
    const hours = (activeRecord.clockOut - activeRecord.clockIn) / (1000 * 60 * 60);
    activeRecord.totalHours = Number(hours.toFixed(3));
    activeRecord.calculatedPay = activeRecord.totalHours * (employee.hourlyRate || 0);

    await activeRecord.save();
    
    console.log('Обновленная запись:', activeRecord);

    res.json(activeRecord);
  } catch (error) {
    console.error('Ошибка при завершении записи:', error);
    res.status(500).json({ message: 'Ошибка сервера при завершении записи' });
  }
};

// Получение записей
export const getTimeRecords = async (req, res) => {
  try {
    const timeRecords = await TimeRecord.find({
      employee: req.user.id
    })
    .sort({ date: -1 })
    .populate('employee', 'name')
    .lean();

    console.log('Записи:', timeRecords);
    
    res.json(timeRecords);
  } catch (error) {
    console.error('Ошибка при получении записей:', error);
    res.status(500).json({ message: error.message });
  }
};
// Получить записи времени конкретного сотрудника
export const getEmployeeTimeRecords = async (req, res) => {
  try {
    const timeRecords = await TimeRecord.find({ 
      employee: req.params.employeeId 
    });
    
    res.json(timeRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Получение всех записей для админа
export const getAllTimeRecords = async (req, res) => {
  try {
    const timeRecords = await TimeRecord.find()
      .populate('employee', 'name hourlyRate position')
      .sort({ date: -1 })
      .lean();

    // Не округляем часы при возврате данных
    const processedRecords = timeRecords.map(record => ({
      ...record,
      totalHours: record.totalHours ? Number(record.totalHours) : 0
    }));
    
    res.json(processedRecords);
  } catch (error) {
    console.error('Ошибка при получении записей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};
export const getMonthlyTimeRecords = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Проверяем наличие параметров
    if (!month || !year) {
      return res.status(400).json({ message: 'Необходимо указать месяц и год' });
    }

    // Создаем правильные даты начала и конца месяца
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    // Получаем записи за указанный месяц
    const timeRecords = await TimeRecord.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('employee', 'name position hourlyRate')
    .sort({ date: 1 })
    .lean();

    // Группируем записи по сотрудникам с правильным подсчетом
    const employeeRecords = {};
    
    timeRecords.forEach(record => {
      const employeeId = record.employee?._id?.toString();
      
      if (!employeeId) return;

      if (!employeeRecords[employeeId]) {
        employeeRecords[employeeId] = {
          employee: record.employee,
          totalHours: 0,
          totalPay: 0,
          records: []
        };
      }

      // Учитываем только завершенные записи
      if (record.status === 'completed' && record.totalHours && record.calculatedPay) {
        employeeRecords[employeeId].totalHours += Number(record.totalHours) || 0;
        employeeRecords[employeeId].totalPay += Number(record.calculatedPay) || 0;
      }
      
      employeeRecords[employeeId].records.push(record);
    });

    // Преобразуем объект в массив и округляем значения
    const result = Object.values(employeeRecords).map(record => ({
      ...record,
      totalHours: Number(record.totalHours), // Убираем округление
      totalPay: Number(record.totalPay.toFixed(2))
    }));

    res.json(result);

  } catch (error) {
    console.error('Ошибка при получении месячных записей:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении данных',
      error: error.message 
    });
  }
};

// Для админа
export const getArchiveMonths = async (req, res) => {
  try {
    const records = await TimeRecord.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalHours: { $sum: '$totalHours' },
          totalPay: { $sum: '$calculatedPay' },
          employeeCount: { 
            $addToSet: '$employee'
          },
          records: { $push: '$$ROOT' }
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1
        }
      }
    ]);

    const monthlyStats = records.map(record => {
      const { year, month } = record._id;
      const paddedMonth = month.toString().padStart(2, '0');
      return {
        month: `${year}-${paddedMonth}`,
        totalHours: record.totalHours || 0,
        totalPay: record.totalPay || 0,
        employeeCount: record.employeeCount.length,
        avgHoursPerEmployee: record.employeeCount.length ? 
          (record.totalHours / record.employeeCount.length).toFixed(1) : 0
      };
    });

    console.log('Архивная статистика (админ):', monthlyStats);
    res.json(monthlyStats);
  } catch (error) {
    console.error('Ошибка при получении архивных данных:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeMonthlyDetails = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    
    if (!employeeId || !month || !year) {
      return res.status(400).json({ 
        message: 'Необходимо указать id сотрудника, месяц и год' 
      });
    }

    // Создаем правильные даты начала и конца месяца с UTC
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    // Получаем данные о сотруднике
    const employee = await User.findById(employeeId)
      .select('name position hourlyRate')
      .lean();

    if (!employee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    // Получаем записи времени для сотрудника за выбранный месяц
    const records = await TimeRecord.find({
      employee: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ date: 1 })
    .lean();

    // Расчет итоговых значений с проверкой на null
    const totalHours = records.reduce((sum, record) => 
      sum + (Number(record.totalHours) || 0), 0
    );
    
    const totalPay = records.reduce((sum, record) => 
      sum + (Number(record.calculatedPay) || 0), 0
    );

    res.json({
      employee,
      records,
      totalHours: Number(totalHours.toFixed(1)),
      totalPay: Number(totalPay.toFixed(2))
    });
  } catch (error) {
    console.error('Ошибка при получении деталей сотрудника:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeMonthlyRecords = async (req, res) => {
  try {
    const { month, year } = req.query;
    const employeeId = req.user.id; // Получаем ID текущего пользователя
    
    if (!month || !year) {
      return res.status(400).json({ message: 'Необходимо указать месяц и год' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Получаем данные о сотруднике
    const employee = await User.findById(employeeId)
      .select('name position hourlyRate')
      .lean();

    if (!employee) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    // Получаем записи за месяц
    const records = await TimeRecord.find({
      employee: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ date: 1 })
    .lean();

    // Расчет итогов
    const totalHours = records.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const totalPay = records.reduce((sum, record) => sum + (record.calculatedPay || 0), 0);
    const workDays = records.filter(record => record.status === 'completed').length;

    const response = {
      employee,
      records,
      summary: {
        totalHours,
        totalPay,
        workDays
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Ошибка при получении записей:', error);
    res.status(500).json({ 
      message: 'Ошибка при получении данных',
      error: error.message 
    });
  }
};

export const getEmployeeArchiveMonths = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(employeeId);
    
    const records = await TimeRecord.aggregate([
      {
        $match: { 
          employee: objectId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalHours: { $sum: '$totalHours' },
          totalPay: { $sum: '$calculatedPay' },
          daysWorked: { $sum: 1 },
          records: { $push: '$$ROOT' }
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1
        }
      }
    ]);

    const monthlyStats = records.map(record => {
      const { year, month } = record._id;
      const paddedMonth = month.toString().padStart(2, '0');
      return {
        month: `${year}-${paddedMonth}`,
        totalHours: record.totalHours || 0,
        totalPay: record.totalPay || 0,
        daysWorked: record.daysWorked || 0,
        avgHoursPerDay: record.daysWorked ? (record.totalHours / record.daysWorked).toFixed(1) : 0
      };
    });

    console.log('Архивная статистика сотрудника:', monthlyStats);
    res.json(monthlyStats);
  } catch (error) {
    console.error('Ошибка при получении архивных данных:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getEmployeeStats = async (req, res) => {
  try {
    const employeeId = req.user.id;
    
    // Получаем все записи сотрудника
    const allRecords = await TimeRecord.find({
      employee: employeeId,
      status: 'completed'
    }).lean();

    // Расчет общего количества часов и заработка
    const totalHours = allRecords.reduce((sum, record) => 
      sum + (record.totalHours || 0), 0);
    
    const totalEarnings = allRecords.reduce((sum, record) => 
      sum + (record.calculatedPay || 0), 0);

    // Расчет часов за текущую неделю
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const hoursThisWeek = allRecords
      .filter(record => new Date(record.date) >= startOfWeek)
      .reduce((sum, record) => sum + (record.totalHours || 0), 0);

    // Расчет посещаемости
    const totalWorkDays = allRecords.length;
    const onTimeArrivals = allRecords.filter(record => {
      const clockIn = new Date(record.clockIn);
      const workStart = new Date(record.date);
      workStart.setHours(9, 0, 0, 0);
      return clockIn <= workStart;
    }).length;

    const attendanceRate = totalWorkDays > 0 
      ? Math.round((onTimeArrivals / totalWorkDays) * 100)
      : 100;

    res.json({
      totalHours,
      totalEarnings,
      hoursThisWeek,
      attendanceRate
    });

  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ message: error.message });
  }
};