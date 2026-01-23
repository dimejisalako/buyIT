export const runtime = "nodejs";
import { NextResponse } from 'next/server';

// Mock trending products for now since google-trends-api might have issues
const MOCK_TRENDING_KEYWORDS = [
  "iPhone 15 Pro Max",
  "Samsung Galaxy S24",
  "MacBook Air M2",
  "Sony WH-1000XM5",
  "iPad Pro",
  "AirPods Pro",
  "Nintendo Switch",
  "Canon EOS R50",
  "Fitbit Charge 6",
  "Echo Dot",
  "Kindle Paperwhite",
  "Apple Watch Series 9",
  "Dell XPS 13",
  "Bose QuietComfort",
  "GoPro Hero 12",
  "Gaming Chair",
  "Mechanical Keyboard",
  "Wireless Mouse",
  "Monitor 4K",
  "USB-C Hub"
];

export async function GET() {
  try {
    // For now, return mock data to avoid API issues
    // TODO: Implement proper Google Trends API integration when stable
    
    // Simulate some randomness in the trending items
    const shuffled = [...MOCK_TRENDING_KEYWORDS].sort(() => 0.5 - Math.random());
    const trends = shuffled.slice(0, Math.floor(Math.random() * 8) + 6); // 6-14 items
    
    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch trends', 
      trends: MOCK_TRENDING_KEYWORDS.slice(0, 10) // Fallback to first 10 items
    }, { status: 200 }); // Return 200 with fallback data instead of 500
  }
} 