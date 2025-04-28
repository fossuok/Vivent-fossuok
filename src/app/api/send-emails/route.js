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

    const { templateId, workshop, senderName, senderEmail, studentIds } = await request.json();

    if (!templateId || !workshop || !senderName || !senderEmail || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Missing required fields or studentIds' }, { status: 400 });
    }

    // Get template
    const template = await EmailTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Get only the students with the given IDs
    const StudentModel = getStudentModel(workshop);
    const students = await StudentModel.find({ _id: { $in: studentIds } });

    if (students.length === 0) {
      return NextResponse.json({ error: 'No recipients found for provided student IDs' }, { status: 400 });
    }

    // Create or update email log (one log per batch)
    const emailLog = await EmailLog.create({
      templateId,
      workshop,
      senderName,
      senderEmail,
      recipientCount: students.length,
      status: 'in_progress'
    });


    // Send emails in batches of 10
    const batchSize = 10;
    let successCount = 0;
    let failedCount = 0;
    const failedRecipients = [];

    // Initialize Mailjet
    const mailjet = Mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC,
      process.env.MJ_APIKEY_PRIVATE
    );

    // Helper to replace all placeholders in the template with student data
    function personalizeHtml(html, student) {
      return Object.keys(student.toObject()).reduce((acc, key) => {
        if (['_id', '__v', 'attended'].includes(key)) return acc;
        const value = student[key] ?? '';
        const regex = new RegExp(`{{${key}}}`, 'g');
        return acc.replace(regex, value);
      }, html);
    }

    // Process in batches
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);

      // Prepare messages for this batch
      const messages = batch.map(student => {
        const personalizedHtml = personalizeHtml(template.html, student);
        return {
          From: { Email: senderEmail, Name: senderName },
          To: [{ Email: student.email, Name: `${student.firstName} ${student.lastName}` }],
          Subject: template.subject,
          HTMLPart: personalizedHtml
        };
      });

      try {
        await mailjet
          .post('send', { version: 'v3.1' })
          .request({ Messages: messages });

        successCount += batch.length;
      } catch (error) {
        failedCount += batch.length;
        batch.forEach(student => {
          failedRecipients.push({
            email: student.email,
            error: error.message || 'Failed to send'
          });
        });
      }

      // Update log after each batch
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        successCount,
        failedCount,
        failedRecipients
      });

      // Delay between batches to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final log update
    await EmailLog.findByIdAndUpdate(emailLog._id, {
      status: failedCount === 0 ? 'completed' : 'failed',
      completedAt: new Date(),
      successCount,
      failedCount,
      failedRecipients
    });

    return NextResponse.json({
      success: true,
      logId: emailLog._id,
      recipientCount: students.length,
      successCount,
      failedCount
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to send emails'
    }, { status: 500 });
  }
}
