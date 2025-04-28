// src/app/api/email-logs/route.js
import { NextResponse } from 'next/server';
import EmailLog from '@/models/EmailLog';
import dbConnect from '@/lib/db';

// GET: Fetch the latest 50 email logs, sorted by start time (most recent first)
export async function GET() {
  try {
    await dbConnect();
    const logs = await EmailLog.find({})
      .sort({ startedAt: -1 })
      .limit(50);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email logs' },
      { status: 500 }
    );
  }
}

// POST: (optional) Create a new email log entry
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const newLog = await EmailLog.create(data);
    return NextResponse.json({ success: true, log: newLog });
  } catch (error) {
    console.error('Error creating email log:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create email log' },
      { status: 500 }
    );
  }
}
