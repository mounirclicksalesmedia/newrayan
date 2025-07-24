import { NextResponse } from 'next/server';

interface GoHighLevelWebhookData {
  data: Array<{
    event_name: string;
    event_time: string;
    action_source: string;
    user_data: {
      phone: string;
      email: string;
      fbc: string;
      fbp: string;
    };
    custom_data: {
      content_name: string;
      value: number;
      currency: string;
    };
  }>;
}

interface MetaEventData {
  event_name: string;
  event_time: number;
  action_source: string;
  user_data: {
    phone?: string;
    email?: string;
    fbc?: string;
    fbp?: string;
  };
  custom_data: {
    content_name: string;
    value: number;
    currency: string;
  };
}

interface MetaConversionPayload {
  data: MetaEventData[];
  access_token: string;
}

// GET handler for when someone accesses the endpoint directly
export async function GET() {
  return NextResponse.json({
    message: "GoHighLevel Webhook Endpoint",
    description: "This endpoint accepts POST requests from GoHighLevel webhooks to forward conversion data to Facebook Conversion API",
    usage: "Configure this URL as your GoHighLevel webhook endpoint",
    methods: ["POST"],
    expectedPayload: {
      data: [{
        event_name: "WhatsAppMessageSent",
        event_time: "unix_timestamp",
        action_source: "website",
        user_data: {
          phone: "user_phone",
          email: "user_email",
          fbc: "facebook_click_id",
          fbp: "facebook_browser_id"
        },
        custom_data: {
          content_name: "WhatsApp Lead",
          value: 1.0,
          currency: "USD"
        }
      }]
    },
    status: "active"
  });
}

export async function POST(request: Request) {
  console.log("🔔 Webhook HIT from GHL - POST request received");
  console.log("📅 Timestamp:", new Date().toISOString());
  
  try {
    const webhookData = await request.json() as GoHighLevelWebhookData;
    
    console.log("🔔 Webhook HIT from GHL:");
    console.log("📋 Full payload:", JSON.stringify(webhookData, null, 2));
    console.log("📊 Events count:", webhookData.data?.length || 0);
    
    // Log each event details
    if (webhookData.data && Array.isArray(webhookData.data)) {
      webhookData.data.forEach((event, index) => {
        console.log(`📝 Event ${index + 1}:`, {
          event_name: event.event_name,
          event_time: event.event_time,
          phone: event.user_data?.phone,
          email: event.user_data?.email,
          fbc: event.user_data?.fbc,
          fbp: event.user_data?.fbp
        });
      });
    }
    
    // Facebook Conversion API configuration
    const PIXEL_ID = '714361667908702';
    const ACCESS_TOKEN = 'EAAJ1fU44KCoBOxBNeBGQj24ZBovhmIFXpHhqqcJVMXuF0Ll3AjQhE230nZBCQSoRoDxMfwxeLTrv3k3fnAD99ARYwjMJadx0f7RtU39G09DmRZCTtLQmuEz6y7OF9M6pD7B8j9A3ZBCqM6KEAjyvZCMm5ZC984zFqH5WkLxdQN0oZBjJE7hZCqn02GQ2sFOh7jj7gAZDZD';
    const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;
    
    // Transform GoHighLevel webhook data to Meta Conversion API format
    const metaEvents: MetaEventData[] = webhookData.data.map(event => ({
      event_name: event.event_name,
      event_time: parseInt(event.event_time),
      action_source: event.action_source,
      user_data: {
        phone: event.user_data.phone,
        email: event.user_data.email,
        fbc: event.user_data.fbc,
        fbp: event.user_data.fbp
      },
      custom_data: {
        content_name: event.custom_data.content_name,
        value: event.custom_data.value,
        currency: event.custom_data.currency
      }
    }));

    // Prepare the payload for Meta Conversion API
    const metaPayload: MetaConversionPayload = {
      data: metaEvents,
      access_token: ACCESS_TOKEN
    };

    console.log('🚀 Sending to Meta Conversion API:', {
      url: url,
      eventsCount: metaEvents.length,
      pixelId: PIXEL_ID
    });
    
    // Send the event to Facebook Conversion API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metaPayload),
    });

    const result = await response.json();
    
    console.log('✅ Meta Conversion API Response:', {
      status: response.status,
      statusText: response.statusText,
      result: result
    });
    
    console.log('🎯 GoHighLevel webhook processed successfully:', {
      events: metaEvents.length,
      facebookResponse: result
    });

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${metaEvents.length} events`,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ GoHighLevel webhook processing error:', error);
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