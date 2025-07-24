import { NextResponse } from 'next/server';
import crypto from 'crypto';

interface ConversionData {
  phone?: string;
  email?: string;
  fbc?: string;
  fbp?: string;
  value?: number;
  currency?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
}

interface EventData {
  event_name: string;
  event_time: number;
  action_source: string;
  user_data: {
    phone?: string;
    email?: string;
    fbc?: string;
    fbp?: string;
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data?: {
    content_name: string;
    value: number;
    currency: string;
  };
}

interface ConversionPayload {
  data: EventData[];
  access_token: string;
}

// Function to hash user data for Meta Conversion API
function hashSHA256(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

// GET handler for when someone accesses the endpoint directly
export async function GET() {
  return NextResponse.json({
    message: "Meta Conversion API Endpoint",
    description: "This endpoint accepts POST requests to send conversion data to Facebook Conversion API",
    usage: "Send POST request with conversion data including fbc, fbp, phone, email, etc.",
    methods: ["POST"],
    status: "active"
  });
}

// Meta Pixel server-side conversion API
export async function POST(request: Request) {
  console.log("🔔 Meta Conversion API HIT - POST request received");
  console.log("📅 Timestamp:", new Date().toISOString());
  
  try {
    const data = await request.json() as ConversionData;
    
    console.log("📋 Conversion data received:", {
      hasPhone: !!data.phone,
      hasEmail: !!data.email,
      hasFbc: !!data.fbc,
      hasFbp: !!data.fbp,
      value: data.value,
      currency: data.currency
    });
    
    // Facebook Conversion API endpoint
    const PIXEL_ID = '714361667908702';
    const ACCESS_TOKEN = 'EAAJ1fU44KCoBOxBNeBGQj24ZBovhmIFXpHhqqcJVMXuF0Ll3AjQhE230nZBCQSoRoDxMfwxeLTrv3k3fnAD99ARYwjMJadx0f7RtU39G09DmRZCTtLQmuEz6y7OF9M6pD7B8j9A3ZBCqM6KEAjyvZCMm5ZC984zFqH5WkLxdQN0oZBjJE7hZCqn02GQ2sFOh7jj7gAZDZD';
    const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;
    
    // Current timestamp in seconds
    const event_time = Math.floor(Date.now() / 1000); // current Unix time
    
    // Prepare user data
    const user_data: EventData['user_data'] = {};
    
    // Hash and add user data (Meta requires hashed PII)
    console.log(`🔐 Hashing user data for conversion`);
    if (data.phone) {
      user_data.phone = hashSHA256(data.phone);
      console.log(`📞 Phone hashed: ${user_data.phone ? user_data.phone.substring(0, 10) + '...' : 'N/A'}`);
    }
    if (data.email) {
      user_data.email = hashSHA256(data.email);
      console.log(`📧 Email hashed: ${user_data.email ? user_data.email.substring(0, 10) + '...' : 'N/A'}`);
    }
    if (data.fbc) user_data.fbc = data.fbc;
    if (data.fbp) user_data.fbp = data.fbp;
    if (data.ip) user_data.client_ip_address = data.ip;
    if (data.userAgent) user_data.client_user_agent = data.userAgent;
    
    // Prepare the event data
    const eventData: ConversionPayload = {
      data: [
        {
          event_name: data.phone ? "WhatsAppMessageSent" : "whatsapp_button",
          event_time: event_time, // current Unix time
          action_source: "website",
          user_data: user_data,
          custom_data: {
            content_name: data.phone ? "WhatsApp Lead" : "WhatsApp Lead",
            value: data.value || 1.0,
            currency: data.currency || "USD"
          }
        }
      ],
      access_token: ACCESS_TOKEN
    };
    
    console.log('🚀 Sending to Meta Conversion API:', {
      url: url,
      eventName: eventData.data[0].event_name,
      pixelId: PIXEL_ID
    });
    
    // Send the event to Facebook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    const result = await response.json();
    
    console.log('✅ Meta Conversion API Response:', {
      status: response.status,
      statusText: response.statusText,
      result: result
    });
    
    return NextResponse.json({ 
      success: true, 
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Meta Conversion API error:', error);
    console.error('🔍 Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 