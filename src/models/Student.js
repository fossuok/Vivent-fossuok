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

// Function to get model for specific workshop
export const getStudentModel = (workshopName) => {
    const collectionName = `students_${workshopName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    
    // Check if model already exists to prevent model overwrite warnings
    return mongoose.models[collectionName] || 
           mongoose.model(collectionName, studentSchema, collectionName);
  };

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
