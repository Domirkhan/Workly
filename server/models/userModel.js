import mongoose from 'mongoose';

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

export default mongoose.model('User', userSchema);