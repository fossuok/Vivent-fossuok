// src/app/api/import-logs/route.js
import { NextResponse } from 'next/server';
import ImportLog from '@/models/ImportLog';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    await dbConnect();
    const logs = await ImportLog.find({})
      .sort({ timestamp: -1 })
      .limit(50);
    
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching import logs:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch import logs' 
    }, { status: 500 });
  }
}
