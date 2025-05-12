import mongoose from 'mongoose';
import crypto from 'node:crypto';
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  qrCode: {
    type: String,
    default: null
  },
  qrCodeExpiry: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Добавляем метод для проверки валидности QR-кода
companySchema.methods.isQRCodeValid = function() {
  if (!this.qrCode || !this.qrCodeExpiry) {
    return false;
  }
  const now = new Date();
  console.log('Текущее время:', now);
  console.log('Время истечения:', this.qrCodeExpiry);
  return this.qrCodeExpiry > now;
};

// Добавляем метод для генерации нового QR-кода
companySchema.methods.generateNewQRCode = function() {
  this.qrCode = crypto.randomBytes(32).toString('hex');
  this.qrCodeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Код действует 24 часа
  return this.qrCode;
};

const Company = mongoose.model('Company', companySchema);
export default Company;