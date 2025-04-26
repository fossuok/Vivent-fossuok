import Student from '@/models/Student';
import dbConnect from '@/lib/db';

export async function GET() {
  await dbConnect();
  const students = await Student.find({});
  return Response.json(students);
}

export async function POST(request) {
  await dbConnect();
  const data = await request.json();
  const student = await Student.create(data);
  return Response.json(student);
}

export async function DELETE(request) {
  await dbConnect();
  const { id } = await request.json();
  await Student.findByIdAndDelete(id);
  return Response.json({ status: 'success' });
}
