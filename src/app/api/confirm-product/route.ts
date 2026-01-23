import { NextResponse } from 'next/server';
import { db } from '../../../lib/database';

export async function POST(req: Request) {
  try {
    const { requestId, confirmed } = await req.json();

    if (!requestId) {
      return NextResponse.json({ 
        error: 'Request ID is required' 
      }, { status: 400 });
    }

    const request = db.getRequestById(requestId);
    if (!request) {
      return NextResponse.json({ 
        error: 'Request not found' 
      }, { status: 404 });
    }

    if (confirmed) {
      // Customer confirmed the product
      const updatedRequest = db.updateRequestStatus(requestId, 'confirmed', {
        confirmedAt: new Date(),
      });

      // TODO: Send confirmation email to customer
      await sendConfirmationEmail(updatedRequest!);

      return NextResponse.json({
        success: true,
        message: 'Thank you for confirming! Your order has been confirmed. Purchase will be completed in 12-24 hours.',
        status: 'confirmed',
        estimatedCompletion: '12-24 hours'
      });
    } else {
      // Customer rejected the product
      const updatedRequest = db.updateRequestStatus(requestId, 'pending');

      return NextResponse.json({
        success: true,
        message: 'No problem! Please submit a new request with the correct product link.',
        status: 'rejected'
      });
    }

  } catch (error) {
    console.error('Confirm product API error:', error);
    return NextResponse.json({
      error: 'Failed to process confirmation. Please try again.',
    }, { status: 500 });
  }
}

// GET endpoint for confirmation page
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get('id');

    if (!requestId) {
      return NextResponse.json({ 
        error: 'Request ID is required' 
      }, { status: 400 });
    }

    const request = db.getRequestById(requestId);
    if (!request) {
      return NextResponse.json({ 
        error: 'Request not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      request: {
        id: request.id,
        productTitle: request.productTitle,
        amazonUrl: request.amazonUrl,
        status: request.status,
        screenshotUrl: request.screenshotUrl,
        estimatedPrice: request.estimatedPrice,
      }
    });

  } catch (error) {
    console.error('Get confirmation API error:', error);
    return NextResponse.json({
      error: 'Failed to load confirmation details.',
    }, { status: 500 });
  }
}

// Simulate confirmation email (replace with real email service)
async function sendConfirmationEmail(request: any) {
  console.log(`
    📧 CUSTOMER CONFIRMATION EMAIL:
    
    Order Confirmed! 🎉
    
    Hi ${request.customerName || 'Valued Customer'},
    
    Thank you for confirming your product selection!
    
    Order Details:
    - Product: ${request.productTitle}
    - Request ID: ${request.id}
    - Status: Confirmed ✅
    
    What happens next:
    ✅ Your order has been confirmed
    🛒 We will purchase the item from Amazon within 12-24 hours
    📦 You'll receive shipping updates via email
    💰 Payment instructions will be sent separately
    
    Estimated completion: 12-24 hours
    
    Questions? Reply to this email or contact support.
    
    Best regards,
    BuyIT Team
  `);
  
  return true;
}

