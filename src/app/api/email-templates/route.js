// src/app/api/email-templates/route.js
import { NextResponse } from 'next/server';
import EmailTemplate from '@/models/EmailTemplate';
import dbConnect from '@/lib/db';
import { writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';
import { ensureTempDir } from '@/lib/fileUtil';

export async function GET() {
  try {
    await dbConnect();
    const templates = await EmailTemplate.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch templates' 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const formData = await request.formData();
    const file = formData.get('htmlFile');
    const name = formData.get('name');
    const subject = formData.get('subject');
    
    if (!file || !name || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create temp directory and save file
    const tempDir = await ensureTempDir();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(tempDir, fileName);
    
    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Read the HTML content
    const html = await readFile(filePath, 'utf8');
    
    // Create template in database
    const template = await EmailTemplate.create({
      name,
      subject,
      html
    });
    
    // Clean up temp file
    await unlink(filePath);
    
    return NextResponse.json({ 
      success: true, 
      template: template
    });
    
  } catch (error) {
    console.error('Template upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload template' 
    }, { status: 500 });
  }
}
