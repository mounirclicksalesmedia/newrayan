# Meta Conversion API & GoHighLevel Integration Guide

Complete implementation guide for Facebook Meta Conversion API with GoHighLevel webhook integration, including fbc/fbp parameter tracking and SHA-256 hashing.

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Client-Side Implementation](#client-side-implementation)
4. [GoHighLevel Integration](#gohighlevel-integration)
5. [Testing & Debugging](#testing--debugging)
6. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This implementation provides:
- ✅ **Facebook Conversion API integration** with proper SHA-256 hashing
- ✅ **GoHighLevel webhook handling** for WhatsApp conversions
- ✅ **fbc/fbp parameter tracking** from Facebook ads
- ✅ **Client-side tracking** for WhatsApp button clicks
- ✅ **Comprehensive logging** for debugging

## 🚀 API Endpoints

### 1. Meta Conversion API Endpoint

**File:** `app/api/meta-conversion/route.ts`

```typescript
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
    
    // Facebook Conversion API configuration
    const PIXEL_ID = 'YOUR_PIXEL_ID'; // Replace with your actual Pixel ID
    const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // Replace with your actual access token
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
          event_time: Math.floor(Date.now() / 1000), // current Unix time
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
```

### 2. GoHighLevel Webhook Endpoint

**File:** `app/api/gohighlevel-webhook/route.ts`

```typescript
import { NextResponse } from 'next/server';
import crypto from 'crypto';

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

// Function to hash user data for Meta Conversion API
function hashSHA256(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
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
        event_time: "unix_timestamp", // current Unix time
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
    const PIXEL_ID = 'YOUR_PIXEL_ID'; // Replace with your actual Pixel ID
    const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // Replace with your actual access token
    const url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;
    
    // Transform GoHighLevel webhook data to Meta Conversion API format
    const metaEvents: MetaEventData[] = webhookData.data.map(event => {
      console.log(`🔐 Hashing user data for event: ${event.event_name}`);
      console.log(`📞 Original phone: ${event.user_data.phone ? '[REDACTED]' : 'N/A'}`);
      console.log(`📧 Original email: ${event.user_data.email ? '[REDACTED]' : 'N/A'}`);
      
      const hashedPhone = hashSHA256(event.user_data.phone);
      const hashedEmail = hashSHA256(event.user_data.email);
      
      console.log(`🔒 Hashed phone: ${hashedPhone ? hashedPhone.substring(0, 10) + '...' : 'N/A'}`);
      console.log(`🔒 Hashed email: ${hashedEmail ? hashedEmail.substring(0, 10) + '...' : 'N/A'}`);
      
      return {
        event_name: event.event_name,
        event_time: parseInt(event.event_time), // current Unix time
        action_source: event.action_source,
        user_data: {
          phone: hashedPhone,
          email: hashedEmail,
          fbc: event.user_data.fbc,
          fbp: event.user_data.fbp
        },
        custom_data: {
          content_name: event.custom_data.content_name,
          value: event.custom_data.value,
          currency: event.custom_data.currency
        }
      };
    });

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
```

## 💻 Client-Side Implementation

### 1. Facebook Pixel Integration

Add to your `layout.tsx` or `head` section:

```html
<!-- Meta Pixel Code -->
<script
  dangerouslySetInnerHTML={{
    __html: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', 'YOUR_PIXEL_ID');
      fbq('track', 'PageView');
    `,
  }}
/>
<noscript
  dangerouslySetInnerHTML={{
    __html: `<img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
    />`,
  }}
/>
```

### 2. fbc/fbp Parameter Tracking

```typescript
// Function to get Meta Pixel parameters (fbc and fbp)
const getMetaPixelParams = () => {
  let fbc = '';
  let fbp = '';
  
  if (typeof window !== 'undefined') {
    // Try multiple sources in order of preference
    
    // 1. Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    fbc = urlParams.get('fbc') || '';
    fbp = urlParams.get('fbp') || '';
    
    // 2. Check localStorage
    if (!fbc) fbc = localStorage.getItem('_fbc') || '';
    if (!fbp) fbp = localStorage.getItem('_fbp') || '';
    
    // 3. Check cookies as fallback
    if (!fbc || !fbp) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === '_fbc' && !fbc) fbc = value;
        if (name === '_fbp' && !fbp) fbp = value;
      }
    }
    
    // 4. Try to get fbp from Facebook Pixel if available
    const fbqWindow = window as FbqWindow;
    if (!fbp && fbqWindow.fbq && fbqWindow.fbq.getState) {
      try {
        const pixelState = fbqWindow.fbq.getState();
        if (pixelState?.pixels?.['YOUR_PIXEL_ID']?.userData?._fbp) {
          const fbpFromPixel = pixelState.pixels['YOUR_PIXEL_ID'].userData._fbp;
          if (fbpFromPixel) {
            fbp = fbpFromPixel;
            // Store it for future use
            localStorage.setItem('_fbp', fbp);
          }
        }
      } catch {
        console.log('Could not retrieve fbp from Facebook Pixel state');
      }
    }
  }
  
  return { fbc, fbp };
};

// Store fbc and fbp from URL parameters in localStorage for persistence
useEffect(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const fbcParam = urlParams.get('fbc');
    const fbpParam = urlParams.get('fbp');
    
    if (fbcParam) {
      localStorage.setItem('_fbc', fbcParam);
      // Also set as cookie for better compatibility
      document.cookie = `_fbc=${fbcParam}; path=/; max-age=604800`; // 7 days
    }
    
    if (fbpParam) {
      localStorage.setItem('_fbp', fbpParam);
      // Also set as cookie for better compatibility
      document.cookie = `_fbp=${fbpParam}; path=/; max-age=604800`; // 7 days
    }
  }
}, []);
```

### 3. WhatsApp Button Tracking

```typescript
// Define TypeScript interfaces
interface FbqWindow extends Window {
  fbq?: {
    (command: string, event: string, params?: Record<string, string | number | boolean | null>): void;
    getState?: () => {
      pixels?: {
        [key: string]: {
          userData?: {
            _fbp?: string;
          };
        };
      };
    };
  };
}

// Track WhatsApp button click
const trackWhatsAppClick = () => {
  // Meta Pixel event tracking
  if (typeof window !== 'undefined') {
    const fbqWindow = window as FbqWindow;
    if (fbqWindow.fbq) {
      fbqWindow.fbq('track', 'whatsapp_button');
    }

    // Get Meta Pixel tracking parameters
    const { fbc, fbp } = getMetaPixelParams();

    // Send server-side conversion event with fbc and fbp
    try {
      fetch('/api/meta-conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          url: window.location.href,
          fbc: fbc,
          fbp: fbp
        }),
      });
    } catch (error) {
      console.error('Error sending Meta conversion event:', error);
    }
  }
};

// Example WhatsApp button with tracking
<button onClick={trackWhatsAppClick}>
  Contact via WhatsApp
</button>
```

## 🔗 GoHighLevel Integration

### 1. Webhook Configuration

In GoHighLevel, configure your webhook to point to:
```
https://yourdomain.com/api/gohighlevel-webhook
```

### 2. Expected Payload Format

GoHighLevel should send data in this format:

```json
{
  "data": [
    {
      "event_name": "WhatsAppMessageSent",
      "event_time": "{{ contact.created_epoch }}", // current Unix time
      "action_source": "website",
      "user_data": {
        "phone": "{{ contact.phone }}",
        "email": "{{ contact.email }}",
        "fbc": "{{ contact.custom_field.fbc }}",
        "fbp": "{{ contact.custom_field.fbp }}"
      },
      "custom_data": {
        "content_name": "WhatsApp Lead",
        "value": 1.00,
        "currency": "USD"
      }
    }
  ]
}
```

## 🧪 Testing & Debugging

### 1. Test Webhook HTML

Create a test file to validate your implementation:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meta API Test</title>
</head>
<body>
    <h1>Meta API Test</h1>
    
    <h3>Test GoHighLevel Webhook</h3>
    <button onclick="testWebhook()">Send Test Webhook</button>
    
    <h3>Test Landing Page with Meta Parameters</h3>
    <a href="/?fbc=fb.1.1703123456.test_fbc_value&fbp=fb.1.1703123456.test_fbp_value" target="_blank">
        Test Landing Page with Meta Parameters
    </a>
    
    <div id="result"></div>

    <script>
        async function testWebhook() {
            const payload = {
                "data": [
                    {
                        "event_name": "WhatsAppMessageSent",
                        "event_time": "1703123456", // current Unix time
                        "action_source": "website",
                        "user_data": {
                            "phone": "+1234567890",
                            "email": "test@example.com",
                            "fbc": "fb.1.1703123456.test_fbc_value",
                            "fbp": "fb.1.1703123456.test_fbp_value"
                        },
                        "custom_data": {
                            "content_name": "WhatsApp Lead",
                            "value": 1.00,
                            "currency": "USD"
                        }
                    }
                ]
            };
            
            try {
                const response = await fetch('/api/gohighlevel-webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                document.getElementById('result').textContent = JSON.stringify(result, null, 2);
            } catch (error) {
                document.getElementById('result').textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
```

### 2. Monitoring Logs

Look for these log indicators in your deployment:

- 🔔 **Webhook received**
- 📋 **Data payload**
- 🔐 **Hashing process**
- 🚀 **Sending to Meta**
- ✅ **Success response**
- ❌ **Error occurred**

## 🔧 Troubleshooting

### Common Issues & Solutions

**1. "Insufficient customer information" Error**
- ✅ **Solution**: Ensure phone/email are being hashed with SHA-256
- ✅ **Check**: User data contains at least one of: phone, email, fbc, fbp

**2. 405 Method Not Allowed**
- ✅ **Solution**: Ensure you're sending POST requests to the endpoints
- ✅ **Check**: GET requests will show endpoint information

**3. fbc/fbp Not Captured**
- ✅ **Solution**: Check URL parameters and localStorage
- ✅ **Check**: Facebook ads are adding fbc/fbp to URLs

**4. Webhook Not Receiving Data**
- ✅ **Solution**: Verify GoHighLevel webhook URL configuration
- ✅ **Check**: Endpoint logs for incoming requests

### Required Configuration

Replace these placeholders with your actual values:

```typescript
const PIXEL_ID = 'YOUR_PIXEL_ID'; // Your Facebook Pixel ID
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // Your Facebook Conversion API access token
```

## 📝 Implementation Checklist

- [ ] Create API endpoints (`meta-conversion` and `gohighlevel-webhook`)
- [ ] Add Facebook Pixel to your website
- [ ] Implement client-side fbc/fbp tracking
- [ ] Configure GoHighLevel webhook URL
- [ ] Test with sample data
- [ ] Monitor logs for successful conversions
- [ ] Verify Meta Events Manager shows events

## 🔐 Security Notes

- ✅ **All PII (phone, email) is automatically hashed with SHA-256**
- ✅ **fbc/fbp parameters are stored securely in localStorage/cookies**
- ✅ **Access tokens are server-side only**
- ✅ **Comprehensive logging for debugging**

---

**🎯 Result**: Complete Meta Conversion API integration with GoHighLevel webhook support, automatic data hashing, and comprehensive tracking capabilities. 