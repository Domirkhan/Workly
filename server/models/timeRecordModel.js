import mongoose from 'mongoose';

const timeRecordSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  clockIn: {
    type: Date,
    required: true
  },
  clockOut: {
    type: Date
  },
  totalHours: {
    type: Number
  },
  calculatedPay: {
    type: Number
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

timeRecordSchema.pre('save', function(next) {
  if (this.clockOut) {
    const hours = (this.clockOut - this.clockIn) / (1000 * 60 * 60);
    this.totalHours = Math.round(hours * 100) / 100;
  }
  next();
});

export default mongoose.model('TimeRecord', timeRecordSchema);