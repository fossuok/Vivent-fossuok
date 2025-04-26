import Student from '@/models/Student';
import dbConnect from '@/lib/db';

export async function GET(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const student = await Student.findById(id);
  return Response.json(student);
}

// export async function PUT(request, { params }) {  // Destructure params here
//   await dbConnect();
//   const data = await request.json();
//   const { id } = await params;
//   const student = await Student.findByIdAndUpdate(
//     id,
//     { attended: data.present },
//     { new: true }
//   );
  
//   return Response.json(student);
// }

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = await params;
  const data = await request.json();

  // Determine if it's an attendance update or edit operation
  if (data.present !== undefined) {
    // Handle attendance toggle
    const student = await Student.findByIdAndUpdate(
      id,
      { attended: data.present },
      { new: true }
    );
    return Response.json(student);
  } else {
    // Handle edit operation - only allow specific fields
    const allowedFields = ['firstName', 'lastName', 'phone', 'linkedin', 'studentId'];
    const updateData = {};
    
    // Filter and validate updatable fields
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    // Perform the update
    const student = await Student.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return Response.json(student);
  }
}


