import { NextResponse } from 'next/server';
import { addRequest } from '../../../lib/database';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Basic Amazon URL validation
    if (!url.includes('amazon.com')) {
      return NextResponse.json({ error: 'Please provide a valid Amazon.com URL' }, { status: 400 });
    }

    // In a real app, you'd get the userId from the session
    const userId = 'mock_user_123'; // For demonstration

    const newRequest = addRequest(url, userId);

    // In a real app, you would also send an email notification to the admin here
    console.log(`Admin notification: New product link submitted by ${userId}: ${url}`);

    return NextResponse.json({
      success: true,
      message: 'Link submitted for manual review.',
      requestId: newRequest.id,
    });
  } catch (error) {
    console.error('Submit link API error:', error);
    return NextResponse.json({ error: 'Failed to submit link.' }, { status: 500 });
  }
}

