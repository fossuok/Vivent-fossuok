// src/app/api/send-emails/route.js
import { NextResponse } from 'next/server';
import EmailTemplate from '@/models/EmailTemplate';
import EmailLog from '@/models/EmailLog';
import { getStudentModel } from '@/models/Student';
import dbConnect from '@/lib/db';
import Mailjet from 'node-mailjet';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { templateId, workshop, senderName, senderEmail } = await request.json();
    
    if (!templateId || !workshop || !senderName || !senderEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get template
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    // Get recipients from selected workshop
    const StudentModel = getStudentModel(workshop);
    const students = await StudentModel.find({});
    
    if (students.length === 0) {
      return NextResponse.json({ error: 'No recipients found in selected workshop' }, { status: 400 });
    }
    
    // Create email log
    const emailLog = await EmailLog.create({
      templateId,
      workshop,
      senderName,
      senderEmail,
      recipientCount: students.length,
      status: 'pending'
    });
    
    // Start email sending process (in background)
    sendEmails(emailLog._id, template, students, senderName, senderEmail);
    
    return NextResponse.json({ 
      success: true, 
      logId: emailLog._id,
      recipientCount: students.length
    });
    
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to start email campaign' 
    }, { status: 500 });
  }
}

// Function to send emails in the background
async function sendEmails(logId, template, students, senderName, senderEmail) {
  try {
    await dbConnect();
    
    // Update log status
    await EmailLog.findByIdAndUpdate(logId, { status: 'in_progress' });
    
    // Initialize Mailjet
    const mailjet = Mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC,
      process.env.MJ_APIKEY_PRIVATE
    );
    
    let successCount = 0;
    let failedCount = 0;
    const failedRecipients = [];
    
    // Process in batches of 50 to avoid rate limits
    const batchSize = 50;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      
      // Prepare recipients for this batch
      const messages = batch.map(student => {
        // Replace placeholders in template
        const personalizedHtml = template.html
          .replace(/{{firstName}}/g, student.firstName || '')
          .replace(/{{lastName}}/g, student.lastName || '')
          .replace(/{{email}}/g, student.email || '');
        
        return {
          From: {
            Email: senderEmail,
            Name: senderName
          },
          To: [
            {
              Email: student.email,
              Name: `${student.firstName} ${student.lastName}`
            }
          ],
          Subject: template.subject,
          HTMLPart: personalizedHtml
        };
      });
      
      try {
        // Send emails via Mailjet
        await mailjet
          .post('send', { version: 'v3.1' })
          .request({
            Messages: messages
          });
        
        successCount += batch.length;
      } catch (error) {
        // Handle failures
        failedCount += batch.length;
        batch.forEach(student => {
          failedRecipients.push({
            email: student.email,
            error: error.message || 'Failed to send'
          });
        });
      }
      
      // Update log with progress
      await EmailLog.findByIdAndUpdate(logId, {
        successCount,
        failedCount,
        failedRecipients
      });
      
      // Delay between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Update log status to completed
    await EmailLog.findByIdAndUpdate(logId, {
      status: 'completed',
      completedAt: new Date()
    });
    
  } catch (error) {
    console.error('Background email sending error:', error);
    
    // Update log status to failed
    await EmailLog.findByIdAndUpdate(logId, {
      status: 'failed',
      completedAt: new Date()
    });
  }
}
