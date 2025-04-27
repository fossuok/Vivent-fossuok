// src/models/EmailLog.js
import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailTemplate', required: true },
  workshop: { type: String, required: true },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  recipientCount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed'], default: 'pending' },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  successCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  failedRecipients: [{ 
    email: String, 
    error: String 
  }]
});

export default mongoose.models.EmailLog || mongoose.model('EmailLog', emailLogSchema);
