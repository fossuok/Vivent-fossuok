// models/Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, trim: true },
    phone: { type: String, required: true },
    studentId: { type: String, required: true },
    linkedin: { type: String, required: true },
    ticketId: { type: String, required: true },
    attended: { type: Boolean, default: false }
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
