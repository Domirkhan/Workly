import Company from '../models/companyModel.js';
import User from '../models/userModel.js';
import crypto from 'node:crypto';

export const generateQRCode = async (req, res) => {
  try {
    // Получаем админа
    const admin = await User.findById(req.user.id);
    if (!admin?.companyId) {
      return res.status(400).json({ message: 'Компания не найдена' });
    }

    // Получаем компанию
    const company = await Company.findById(admin.companyId);
    if (!company) {
      return res.status(400).json({ message: 'Компания не найдена' });
    }

    // Генерируем уникальный код
    const code = crypto.randomBytes(32).toString('hex');
    
    // Обновляем QR-код и время его истечения
    company.qrCode = code;
    company.qrCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа
    await company.save();

    res.json({ code: code });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Ошибка при генерации QR-кода' });
  }
};