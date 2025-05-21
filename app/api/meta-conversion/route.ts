import { NextResponse } from 'next/server';

interface ConversionData {
  ip?: string;
  userAgent?: string;
  url?: string;
}

interface EventData {
  event_name: string;
  event_time: number;
  action_source: string;
  user_data: {
    client_ip_address: string;
    client_user_agent: string;
  };
}

interface ConversionPayload {
  data: EventData[];
  access_token: string;
}

// Meta Pixel server-side conversion API
export async function POST(request: Request) {
  try {
    const data = await request.json() as ConversionData;
    
    // Facebook Conversion API endpoint
    const url = 'https://graph.facebook.com/v17.0/714361667908702/events';
    
    // Access token from environment variable or directly (for testing)
    const access_token = 'EAAJ1fU44KCoBOxBNeBGQj24ZBovhmIFXpHhqqcJVMXuF0Ll3AjQhE230nZBCQSoRoDxMfwxeLTrv3k3fnAD99ARYwjMJadx0f7RtU39G09DmRZCTtLQmuEz6y7OF9M6pD7B8j9A3ZBCqM6KEAjyvZCMm5ZC984zFqH5WkLxdQN0oZBjJE7hZCqn02GQ2sFOh7jj7gAZDZD';
    
    // Current timestamp in seconds
    const event_time = Math.floor(Date.now() / 1000);
    
    // Prepare the event data
    const eventData: ConversionPayload = {
      data: [
        {
          event_name: "whatsapp_button",
          event_time: event_time,
          action_source: "website",
          user_data: {
            client_ip_address: data.ip || "",
            client_user_agent: data.userAgent || "",
          }
        }
      ],
      access_token: access_token
    };
    
    // Send the event to Facebook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    const result = await response.json();
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Meta Conversion API error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 