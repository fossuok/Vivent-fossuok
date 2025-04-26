// src/app/api/upload-csv/[workshop]/route.js
import { NextResponse } from 'next/server';
import { getStudentModel } from '@/models/Student';
import ImportLog from '@/models/ImportLog';
import dbConnect from '@/lib/db';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import csv from 'csvtojson';
import { v4 as uuidv4 } from 'uuid';
import { ensureTempDir } from '@/lib/fileUtil';

// Required columns in the CSV
const REQUIRED_COLUMNS = ['firstName', 'lastName', 'email', 'phone', 'studentId', 'linkedin'];

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { workshop } = await params;
    const StudentModel = getStudentModel(workshop);
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('csvFile');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    // Create temp directory and save file
    const tempDir = await ensureTempDir();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(tempDir, fileName);
    
    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Parse CSV to JSON
    const jsonArray = await csv().fromFile(filePath);
    
    // Validate CSV structure
    if (jsonArray.length === 0) {
      await unlink(filePath);
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }
    
    // Check for required columns
    const firstRow = jsonArray[0];
    const missingColumns = REQUIRED_COLUMNS.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      await unlink(filePath);
      return NextResponse.json({ 
        error: `Missing required columns: ${missingColumns.join(', ')}` 
      }, { status: 400 });
    }
    
    // Process and validate each row
    const validStudents = [];
    const skippedStudents = [];
    
    for (const item of jsonArray) {
      // Check for required fields
      if (!item.firstName || !item.lastName || !item.email || !item.phone || !item.studentId || !item.linkedin) {
        skippedStudents.push({
          ...item,
          reason: 'Missing required fields'
        });
        continue;
      }
      
      // Generate ticket ID using UUID
      const ticketId = uuidv4();
      
      validStudents.push({
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        phone: item.phone,
        studentId: item.studentId,
        linkedin: item.linkedin,
        ticketId: ticketId,
        attended: item.attended === 'true' || false
      });
    }
    
    // Insert valid students into the database
    let insertedCount = 0;
    if (validStudents.length > 0) {
      const result = await StudentModel.insertMany(validStudents);
      insertedCount = result.length;
    }
    
    // Create import log
    const importLog = {
      timestamp: new Date(),
      workshop: workshop,
      fileName: file.name,
      totalRows: jsonArray.length,
      successCount: insertedCount,
      skippedCount: skippedStudents.length,
      skippedRows: skippedStudents
    };
    
    // Save import log to database
    await ImportLog.create(importLog);
    
    // Clean up temp file
    await unlink(filePath);
    
    return NextResponse.json({ 
      success: true, 
      imported: insertedCount,
      skipped: skippedStudents.length,
      log: importLog
    });
    
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process CSV file' 
    }, { status: 500 });
  }
}
