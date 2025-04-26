// src/app/api/workshops/[workshop]/students/[id]/route.js
import { getStudentModel } from '@/models/Student';
import dbConnect from '@/lib/db';

export async function GET(request, { params }) {
  await dbConnect();
  const { workshop, id } = await params;
  const StudentModel = getStudentModel(workshop);
  const student = await StudentModel.findById(id);
  return Response.json(student);
}

export async function PUT(request, { params }) {
  await dbConnect();
  const { workshop, id } = await params;
  const StudentModel = getStudentModel(workshop);
  const data = await request.json();
  
  if (data.present !== undefined) {
    // Handle attendance toggle
    const student = await StudentModel.findByIdAndUpdate(
      id,
      { attended: data.present },
      { new: true }
    );
    return Response.json(student);
  } else {
    // Handle edit operation
    const allowedFields = ['firstName', 'lastName', 'phone', 'linkedin', 'studentId'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const student = await StudentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    return Response.json(student);
  }
}
