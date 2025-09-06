import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userAgent, url, fbc, fbp, eventType, formData } = await request.json();

    // Meta Conversion API endpoint
    const pixelId = '1109395797414068';
    const accessToken = 'EAAJ1fU44KCoBPRTbEJuwm5U0Yjngs7ZB9ZBSdYJNaGCMEGqqcsK3qgQdyewhFcnsyfraFKmr9hFnh1AQ93jyqgPZAka9ZA4scey6UkqiUxQlw41qV3P6q5WZAazBMDEEcBNYs8qTfprmDysJpb5iwTDSH8GWLN9B4vAhBfV3QM4ZBiJKnZAxymTUjZCRkFaUtZB9iAgZDZD';
    
    const conversionApiUrl = `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`;

    // Get client IP
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    // Prepare event data
    const eventData: {
      event_name: string;
      event_time: number;
      event_source_url: string;
      user_data: {
        client_ip_address: string;
        client_user_agent: string;
        fbc?: string;
        fbp?: string;
        fn?: string;
        ph?: string;
      };
      action_source: string;
      custom_data?: {
        service?: string;
        content_name?: string;
        content_category?: string;
      };
    } = {
      event_name: eventType === 'form_submit' ? 'Lead' : 'sendWhatsappMessage',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: url,
      user_data: {
        client_ip_address: clientIp,
        client_user_agent: userAgent,
      },
      action_source: 'website'
    };

    // Add fbc and fbp if available
    if (fbc) eventData.user_data.fbc = fbc;
    if (fbp) eventData.user_data.fbp = fbp;

    // Add form data for Lead event
    if (eventType === 'form_submit' && formData) {
      // Hash email if available (not implemented in current form but good practice)
      if (formData.name) {
        // Add name data if needed
        eventData.user_data.fn = formData.name.toLowerCase();
      }
      if (formData.phoneNumber) {
        // Add phone data
        eventData.user_data.ph = formData.phoneNumber.replace(/[^0-9+]/g, '');
      }
      
      // Add custom data
      eventData.custom_data = {
        service: formData.selectedService,
        content_name: 'Dental Service Inquiry',
        content_category: 'dental_services'
      };
    }

    // Send to Meta Conversion API
    const response = await fetch(conversionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [eventData],
        test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Meta Conversion API - Dental:', eventType, 'sent successfully');
      return NextResponse.json({ success: true, result });
    } else {
      console.error('❌ Meta Conversion API Error:', result);
      return NextResponse.json({ success: false, error: result }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Meta Conversion API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
