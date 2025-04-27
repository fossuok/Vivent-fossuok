// src/models/EmailTemplate.js
import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  html: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema);
