import { NextResponse } from 'next/server';
import { getAllRequests } from '../../../../lib/database';

export async function GET() {
  try {
    const requests = getAllRequests();
    
    return NextResponse.json({
      success: true,
      requests: requests
    });
  } catch (error) {
    console.error('Admin requests API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' }, 
      { status: 500 }
    );
  }
}

