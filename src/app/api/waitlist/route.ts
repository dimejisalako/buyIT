import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { isAdmin } from '../../../lib/adminAuth';

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  consentEmail: boolean;
  consentSms: boolean;
  acceptedTerms: boolean;
  createdAt: string;
  ipAddress?: string;
}

// Initialize Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const WAITLIST_KEY = 'shopbrow:waitlist:entries';

// Get all waitlist entries
async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  try {
    const entries = await redis.lrange<WaitlistEntry>(WAITLIST_KEY, 0, -1);
    return entries || [];
  } catch (error) {
    console.error('Error reading from Redis:', error);
    return [];
  }
}

// Add entry to waitlist
async function addWaitlistEntry(entry: WaitlistEntry): Promise<void> {
  await redis.lpush(WAITLIST_KEY, entry);
}

// Check if email exists
async function emailExists(email: string): Promise<boolean> {
  const entries = await getWaitlistEntries();
  return entries.some((entry) => entry.email.toLowerCase() === email.toLowerCase());
}

// POST - Add new entry to waitlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, consentEmail, consentSms, acceptedTerms } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        { success: false, error: 'You must accept the terms and conditions' },
        { status: 400 }
      );
    }

    if (!consentEmail && !consentSms) {
      return NextResponse.json(
        { success: false, error: 'Please consent to at least one contact method' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    if (await emailExists(email)) {
      return NextResponse.json(
        { success: false, error: 'This email is already on our waitlist!' },
        { status: 409 }
      );
    }

    // Create new entry
    const newEntry: WaitlistEntry = {
      id: `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      consentEmail,
      consentSms,
      acceptedTerms,
      createdAt: new Date().toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    };

    await addWaitlistEntry(newEntry);
    
    // Get current count
    const entries = await getWaitlistEntries();

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      position: entries.length,
    });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// GET - Retrieve waitlist data (for admin purposes)
export async function GET(request: NextRequest) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const entries = await getWaitlistEntries();

    return NextResponse.json({
      success: true,
      totalEntries: entries.length,
      lastUpdated: new Date().toISOString(),
      entries: entries,
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
