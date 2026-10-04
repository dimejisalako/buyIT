import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/adminAuth';
import { getAllRequests } from '../../../../lib/database';

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

