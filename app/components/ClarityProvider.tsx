'use client';

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

export default function ClarityProvider() {
  useEffect(() => {
    // Initialize Microsoft Clarity with your project ID
    const projectId = "sk3f7o5lam";
    
    if (typeof window !== 'undefined') {
      try {
        Clarity.init(projectId);
        console.log('✅ Microsoft Clarity initialized successfully');
        
        // Set initial tags for better filtering
        Clarity.setTag('page_type', 'landing_page');
        Clarity.setTag('industry', 'dental_clinic');
        Clarity.setTag('location', 'kuwait');
        
        // Track page load event
        Clarity.event('page_loaded');
        
        // Identify user session for better tracking
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const pageId = `dental_landing_${Date.now()}`;
        Clarity.identify(sessionId, sessionId, pageId, 'Dental Clinic Visitor');
        
        // Set additional context tags
        Clarity.setTag('referrer', document.referrer || 'direct');
        Clarity.setTag('user_agent_mobile', /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'true' : 'false');
        
        console.log('✅ Clarity session identified:', sessionId);
        
      } catch (error) {
        console.error('❌ Failed to initialize Microsoft Clarity:', error);
      }
    }
  }, []);

  return null; // This component doesn't render anything
} 