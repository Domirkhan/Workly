import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  position: { type: String },
  hourlyRate: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  joinDate: { type: Date },
}, {
  timestamps: true
});

// Метод для проверки пароля
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Хеширование пароля перед сохранением
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для проверки активности пользователя
userSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Виртуальное поле для полного имени
userSchema.virtual('fullName').get(function() {
  return `${this.name} (${this.position || 'Должность не указана'})`;
});

export default mongoose.model('User', userSchema);