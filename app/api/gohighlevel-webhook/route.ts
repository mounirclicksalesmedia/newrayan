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

export async function POST(request: Request) {
  try {
    const webhookData = await request.json() as GoHighLevelWebhookData;
    
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

    // Send the event to Facebook Conversion API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metaPayload),
    });

    const result = await response.json();
    
    console.log('GoHighLevel webhook processed:', {
      events: metaEvents.length,
      result: result
    });

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${metaEvents.length} events`,
      result 
    });
    
  } catch (error) {
    console.error('GoHighLevel webhook processing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
} 