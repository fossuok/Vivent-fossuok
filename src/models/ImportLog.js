// src/models/ImportLog.js
import mongoose from 'mongoose';

const importLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  workshop: { type: String, required: true },
  fileName: { type: String, required: true },
  totalRows: { type: Number, required: true },
  successCount: { type: Number, required: true },
  skippedCount: { type: Number, required: true },
  skippedRows: { type: Array, default: [] }
});

export default mongoose.models.ImportLog || mongoose.model('ImportLog', importLogSchema);
