import { getStudentModel } from '@/models/Student';
import dbConnect from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

async function generateUniqueTicketId(StudentModel) {
  let exists = true;
  let ticketId = '';
  while (exists) {
    ticketId = uuidv4();
    exists = await StudentModel.exists({ ticketId });
  }
  return ticketId;
}

export async function GET(request, { params }) {
  await dbConnect();
  const { workshop, id } = await params;
  const StudentModel = getStudentModel(workshop);
  const student = await StudentModel.findById(id);
  return Response.json(student);
}

export async function POST(request, { params }) {
  await dbConnect();
  const { workshop } = await params;
  const StudentModel = getStudentModel(workshop);
  const data = await request.json();

  // Ensure ticketId is present and unique
  let ticketId = data.ticketId;
  if (!ticketId || ticketId.trim() === '') {
    ticketId = await generateUniqueTicketId(StudentModel);
  } else {
    // If ticketId is provided, check uniqueness
    const exists = await StudentModel.exists({ ticketId });
    if (exists) {
      ticketId = await generateUniqueTicketId(StudentModel);
    }
  }

  const student = await StudentModel.create({ ...data, ticketId });
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

    // If ticketId is missing or empty, generate a new unique one
    if (!data.ticketId || data.ticketId.trim() === '') {
      updateData.ticketId = await generateUniqueTicketId(StudentModel);
    } else {
      // Optionally, check if the provided ticketId is unique (and not used by another student)
      const exists = await StudentModel.exists({ ticketId: data.ticketId, _id: { $ne: id } });
      if (exists) {
        // If duplicate, generate a new unique one
        updateData.ticketId = await generateUniqueTicketId(StudentModel);
      } else {
        updateData.ticketId = data.ticketId;
      }
    }

    const student = await StudentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return Response.json(student);
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { workshop } = await params;
  const StudentModel = getStudentModel(workshop);
  const { id } = await request.json();
  await StudentModel.findByIdAndDelete(id);
  return Response.json({ status: 'success' });
}
