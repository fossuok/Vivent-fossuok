// src/app/api/email-templates/[id]/preview/route.js
import { NextResponse } from 'next/server';
import EmailTemplate from '@/models/EmailTemplate';
import dbConnect from '@/lib/db';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const template = await EmailTemplate.findById(id);
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    // Replace placeholders with sample data for preview
    let previewHtml = template.html
      .replace(/{{firstName}}/g, 'John')
      .replace(/{{lastName}}/g, 'Doe')
      .replace(/{{email}}/g, 'john.doe@example.com');
    
    return NextResponse.json({ html: previewHtml });
    
  } catch (error) {
    console.error('Template preview error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate preview' 
    }, { status: 500 });
  }
}
