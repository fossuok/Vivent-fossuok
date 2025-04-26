// src/app/api/workshops/[workshop]/students/route.js
import { getStudentModel } from '@/models/Student';
import dbConnect from '@/lib/db';

export async function GET(request, { params }) {
  await dbConnect();
  const { workshop } = await params;
  const StudentModel = getStudentModel(workshop);
  const students = await StudentModel.find({});
  return Response.json(students);
}

export async function POST(request, { params }) {
  await dbConnect();
  const { workshop } = await params;
  const StudentModel = getStudentModel(workshop);
  const data = await request.json();
  const student = await StudentModel.create(data);
  return Response.json(student);
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { workshop } = await params;
  const StudentModel = getStudentModel(workshop);
  const { id } = await request.json();
  await StudentModel.findByIdAndDelete(id);
  return Response.json({ status: 'success' });
}
