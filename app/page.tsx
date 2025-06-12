"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createPortal } from "react-dom";
import Script from "next/script";
import { useSearchParams } from 'next/navigation';

// Brand colors
const brandOrange = "#f59120";
const brandBlue = "#1d8bb8";

// Social proof data - recent consultations
const recentConsultations = [
  { name: "سارة م.", service: "ابتسامة هوليوود", city: "السالمية" },
  { name: "محمد ع.", service: "تقويم الأسنان", city: "حولي" },
  { name: "فاطمة خ.", service: "تبييض الأسنان", city: "الفروانية" },
  { name: "أحمد س.", service: "زراعة الأسنان", city: "العاصمة" },
  { name: "نورة ط.", service: "فحص أسنان للأطفال", city: "صباح السالم" },
  { name: "عبدالله ر.", service: "تركيبات الأسنان", city: "الجهراء" }
];

function HomeContent() {
  const [scrollY, setScrollY] = useState(0);
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [socialProofVisible, setSocialProofVisible] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState(0);
  const [visitorCount, setVisitorCount] = useState(0);
  const [bookedToday, setBookedToday] = useState(0);
  const [consultationTimes, setConsultationTimes] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);
  
  const searchParams = useSearchParams();

  const buildWhatsAppUrl = useCallback((message: string) => {
    const base = 'https://wa.me/+96566774402';
    const text = encodeURIComponent(message);

    // grab UTM and gclid
    const utmSource   = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');
    const gclid       = searchParams.get('gclid');

    // collect them
    const params = [
      `text=${text}`,
      utmSource   && `utm_source=${utmSource}`,
      utmCampaign && `utm_campaign=${utmCampaign}`,
      gclid       && `gclid=${gclid}`,
    ].filter(Boolean);

    return `${base}?${params.join('&')}`;
  }, [searchParams]);

  // Set hydration state and create portal container
  useEffect(() => {
    setIsHydrated(true);
    // Create portal container for notifications
    if (typeof document !== "undefined") {
      let container = document.getElementById("notification-portal");
      if (!container) {
        container = document.createElement("div");
        container.id = "notification-portal";
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.pointerEvents = "none";
        container.style.zIndex = "9999";
        document.body.appendChild(container);
      }
      setPortalContainer(container);
    }
  }, []);

  // Smooth scroll function
  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80, // Adjust offset to account for fixed header
        behavior: 'smooth'
      });
    }
  }, []);

  // To enable RTL layout globally
  useEffect(() => {
    // Remove direct RTL/lang manipulation since it's now handled in layout.tsx
    // document.documentElement.dir = "rtl";
    // document.documentElement.lang = "ar";
    document.title = "عيادة نيو ريان للأسنان | خدمات طب الأسنان المتميزة في الكويت";
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setBackToTopVisible(window.scrollY > 500);
    };
    
    window.addEventListener("scroll", handleScroll);
    setIsLoaded(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Generate dynamic times for consultations - only run on client side
  useEffect(() => {
    if (!isHydrated) return;
    
    const generateTimes = () => {
      // Generate random minutes between 1-59 for each consultation
      const times = recentConsultations.map((_, index) => {
        // Different time formats for different consultations to appear more natural
        if (index === 0) return `منذ ${Math.floor(Math.random() * 10) + 1} دقائق`;
        if (index === 1) return `منذ ${Math.floor(Math.random() * 30) + 30} دقيقة`;
        if (index === 2) return `منذ ساعة و${Math.floor(Math.random() * 15) + 5} دقيقة`;
        if (index === 3) return `منذ ${Math.floor(Math.random() * 3) + 1} ساعات`;
        if (index === 4) return `اليوم ${Math.random() > 0.5 ? 'صباحاً' : 'مساءً'}`;
        return `منذ ${Math.floor(Math.random() * 3) + 1} ساعات`;
      });
      setConsultationTimes(times);
    };

    generateTimes();
    // Update times occasionally to make them seem more realistic
    const interval = setInterval(() => {
      generateTimes();
    }, 300000); // Update every 5 minutes
    
    return () => clearInterval(interval);
  }, [isHydrated]);

  // Social proof notification effect - only run on client side
  useEffect(() => {
    if (!isHydrated) return;
    
    let notificationTimer: NodeJS.Timeout;
    let cycleTimer: NodeJS.Timeout;
    
    const showNotification = () => {
      setSocialProofVisible(true);
      
      // Reset the timer when showing notification
      clearTimeout(notificationTimer);
      
      // Auto-hide after 15 seconds
      notificationTimer = setTimeout(() => {
        setSocialProofVisible(false);
        
        // After hiding, wait 2 seconds then show the next one
        cycleTimer = setTimeout(() => {
          setCurrentConsultation((prev) => (prev + 1) % recentConsultations.length);
          showNotification();
        }, 2000);
      }, 15000);
    };
    
    // Start the initial notification after 5 seconds
    const initialTimer = setTimeout(() => {
      showNotification();
    }, 5000);
    
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(notificationTimer);
      clearTimeout(cycleTimer);
    };
  }, [isHydrated]);

  // Simulate live visitors and bookings - only run on client side
  useEffect(() => {
    if (!isHydrated) return;
    
    // Generate random initial visitor count (between 15-25)
    const initialVisitors = Math.floor(Math.random() * 11) + 15;
    setVisitorCount(initialVisitors);
    
    // Generate random initial bookings (between 8-15)
    const initialBookings = Math.floor(Math.random() * 8) + 8;
    setBookedToday(initialBookings);
    
    // Occasionally increase visitor count
    const visitorInterval = setInterval(() => {
      const shouldIncrease = Math.random() > 0.7; // 30% chance to increase
      if (shouldIncrease) {
        setVisitorCount(prev => prev + 1);
      }
    }, 20000); // Every 20 seconds
    
    // Occasionally increase booking count
    const bookingInterval = setInterval(() => {
      const shouldIncrease = Math.random() > 0.85; // 15% chance to increase
      if (shouldIncrease) {
        setBookedToday(prev => prev + 1);
      }
    }, 60000); // Every minute
    
    return () => {
      clearInterval(visitorInterval);
      clearInterval(bookingInterval);
    };
  }, [isHydrated]);

  // Don't render content until after RTL is applied to prevent layout shifts
  if (!isLoaded) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{borderColor: brandBlue, borderTopColor: 'transparent'}}></div>
    </div>;
  }

  // Define snaptr type for TypeScript
  interface SnaptrWindow extends Window {
    snaptr?: (command: string, event: string, params?: Record<string, string>) => void;
  }

  // Define gtag type for TypeScript
  interface GtagWindow extends Window {
    gtag?: (command: string, action: string, params?: Record<string, string | number | boolean | null>) => void;
    dataLayer?: unknown[];
    gtag_report_conversion?: (url?: string) => boolean;
  }

  // Define fbq type for TypeScript
  interface FbqWindow extends Window {
    fbq?: (command: string, event: string, params?: Record<string, string | number | boolean | null>) => void;
  }

  // Track WhatsApp button click
  const trackWhatsAppClick = () => {
    if (typeof window !== 'undefined' && (window as SnaptrWindow).snaptr) {
      const snaptr = (window as SnaptrWindow).snaptr;
      if (snaptr) {
        snaptr('track', 'SIGN_UP', {
          'sign_up_method': 'WhatsApp',
        });
      }
    }

    // Google Analytics 4 event tracking
    if (typeof window !== 'undefined') {
      const gtagWindow = window as GtagWindow;
      if (gtagWindow.gtag) {
        gtagWindow.gtag('event', 'whatsapp_click_button', {
          'event_name': 'WhatsApp click button',
          'page_location': window.location.href
        });
      }
      
      // Google Ads conversion tracking
      if (gtagWindow.gtag_report_conversion) {
        gtagWindow.gtag_report_conversion();
      } else if (gtagWindow.gtag) {
        // Fallback if gtag_report_conversion is not defined
        gtagWindow.gtag('event', 'conversion', {
          'send_to': 'AW-17159080860/r5f1CJzdktgaEJyXi_Y_'
        });
      }
    }

    // Meta Pixel event tracking
    if (typeof window !== 'undefined') {
      const fbqWindow = window as FbqWindow;
      if (fbqWindow.fbq) {
        fbqWindow.fbq('track', 'whatsapp_button');
      }

      // Also send server-side conversion event
      try {
        fetch('/api/meta-conversion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userAgent: navigator.userAgent,
            url: window.location.href
          }),
        });
      } catch (error) {
        console.error('Error sending Meta conversion event:', error);
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const hoverScale = {
    scale: 1.05,
    transition: { duration: 0.3 }
  };

  // Simplified Social Proof component that uses a Portal
  const SocialProofNotification = () => {
    if (!portalContainer || !isHydrated) return null;
    
    return createPortal(
      <AnimatePresence>
        {socialProofVisible && (
          <motion.div 
            className="fixed bottom-24 md:right-6 right-2 bg-white rounded-lg shadow-xl p-4 max-w-[280px] w-[calc(100%-20px)] md:w-auto pointer-events-auto"
            style={{ 
              transform: 'translateZ(0)',  // Force hardware acceleration
              backfaceVisibility: 'hidden',
              perspective: 1000,
            }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <i className="fas fa-check text-green-600"></i>
              </div>
              <div className="flex-grow overflow-hidden">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {recentConsultations[currentConsultation].name} من {recentConsultations[currentConsultation].city}
                </p>
                <p className="text-xs text-gray-600">
                  حجز استشارة لـ {recentConsultations[currentConsultation].service} {consultationTimes[currentConsultation] || 'حديثاً'}
                </p>
                <a 
                  href={buildWhatsAppUrl("مرحباً، أرغب في حجز استشارة في عيادة نيو ريان للأسنان")} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-medium flex items-center mt-2 text-green-600 hover:text-green-700"
                  onClick={handleWhatsAppClick("مرحباً، أرغب في حجز استشارة في عيادة نيو ريان للأسنان")}
                >
                  <i className="fab fa-whatsapp mr-1"></i> احجز استشارتك الآن
                </a>
              </div>
              <button 
                className="text-gray-400 hover:text-gray-600 mr-1 flex-shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSocialProofVisible(false);
                }}
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <div className="w-full bg-gray-200 h-1 mt-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-green-500 h-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 15, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      portalContainer
    );
  };

  // Helper function to handle WhatsApp clicks
  const handleWhatsAppClick = (message: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    trackWhatsAppClick();
    // Open WhatsApp with UTM parameters after tracking is complete
    const whatsappUrl = buildWhatsAppUrl(message);
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="font-[family-name:var(--font-tajawal)] bg-gray-50 text-right">
      {/* Snap Pixel Code */}
      <Script id="snap-pixel-script" strategy="afterInteractive">
        {`
          (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
          {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
          a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
          r.src=n;var u=t.getElementsByTagName(s)[0];
          u.parentNode.insertBefore(r,u);})(window,document,
          'https://sc-static.net/scevent.min.js');

          snaptr('init', '9734e9fd-6792-4e5e-a9a5-6ea69b0889dc', {
            'user_email': '__INSERT_USER_EMAIL__'
          });

          snaptr('track', 'PAGE_VIEW');
        `}
      </Script>
      
      {/* Header */}
      <motion.header 
        className="bg-white shadow-md sticky top-0 z-50"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
        style={{
          boxShadow: scrollY > 50 ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'box-shadow 0.3s ease'
        }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image 
                src="/newrayan.png" 
                alt="عيادة الريان المتخصصة" 
                width={180} 
                height={60} 
                className="h-12 w-auto" 
              />
            </div>
            <nav className="hidden md:flex">
              <a 
                href="#home" 
                onClick={(e) => scrollToSection(e, 'home')}
                className="text-gray-700 hover:text-teal-600 font-medium ms-8"
              >
                الرئيسية
              </a>
              <a 
                href="#services" 
                onClick={(e) => scrollToSection(e, 'services')}
                className="text-gray-700 hover:text-teal-600 font-medium ms-8"
              >
                خدماتنا
              </a>
              <a 
                href="#doctors" 
                onClick={(e) => scrollToSection(e, 'doctors')}
                className="text-gray-700 hover:text-teal-600 font-medium ms-8"
              >
                فريقنا الطبي
              </a>
              <a 
                href="#testimonials" 
                onClick={(e) => scrollToSection(e, 'testimonials')}
                className="text-gray-700 hover:text-teal-600 font-medium ms-8"
              >
                آراء المرضى
              </a>
              <a 
                href="#contact" 
                onClick={(e) => scrollToSection(e, 'contact')}
                className="text-gray-700 hover:text-teal-600 font-medium ms-8"
              >
                اتصل بنا
              </a>
            </nav>
            <div className="md:hidden">
              <button className="text-gray-700 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="hidden md:block">
              <motion.div whileHover={hoverScale} whileTap={{ scale: 0.95 }}>
                <a 
                  href={buildWhatsAppUrl("مرحباً، أرغب في حجز موعد في عيادة نيو ريان للأسنان")} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white px-6 py-2 rounded-full transition duration-300 hover:opacity-90 flex items-center gap-2" 
                  style={{background: brandBlue}}
                  onClick={handleWhatsAppClick("مرحباً، أرغب في حجز موعد عبر واتساب")}
                >
                  <i className="fab fa-whatsapp"></i>
                  احجز موعد
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Modern gradient background with animated overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-[#081c3a] via-[#0d2b57] to-[#1d8bb8]">
          <motion.div 
            className="absolute inset-0 opacity-20"
            initial={{ backgroundPosition: '0% 0%' }}
            animate={{ backgroundPosition: '100% 100%' }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '150px 150px'
            }}
          />
        </div>
        
        {/* Floating circles decoration */}
        <div className="absolute inset-0 z-10 overflow-hidden">
          <motion.div 
            className="absolute top-[-5%] right-[-5%] w-[250px] h-[250px] rounded-full opacity-20"
            style={{ background: brandOrange }}
            animate={{ 
              y: [0, 15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              repeatType: 'reverse' 
            }}
          />
          <motion.div 
            className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full opacity-10"
            style={{ background: brandBlue }}
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              repeatType: 'reverse' 
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-20 relative z-20">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              className="lg:w-1/2 text-center lg:text-right mb-10 lg:mb-0 px-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                عيادة نيو ريان للأسنان
                <span className="block mt-2 text-3xl sm:text-4xl lg:text-5xl" style={{color: brandOrange}}>في الكويت</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-white opacity-90 mb-8 max-w-xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                نقدم خدمات طب الأسنان المتكاملة - العلاجية والتجميلية والوقائية بأعلى معايير الجودة
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-s-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <motion.a 
                  href="#services" 
                  className="hidden md:flex bg-transparent border-2 border-white text-white px-6 ml-4 py-3 rounded-full font-bold hover:bg-white hover:opacity-90 transition duration-300 items-center justify-center" 
                  style={{}} 
                  onMouseOver={(e) => { e.currentTarget.style.color = brandBlue }}
                  onMouseOut={(e) => { e.currentTarget.style.color = 'white' }}
                  whileHover={hoverScale}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => scrollToSection(e, 'services')}
                >
                  اكتشف خدماتنا
                </motion.a>

                <motion.a 
                  href={buildWhatsAppUrl("مرحباً، أرغب في حجز موعد عبر واتساب")} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-8 py-3 rounded-full font-bold hover:bg-green-600 transition duration-300 flex items-center justify-center gap-2"
                  whileHover={hoverScale}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsAppClick("مرحباً، أرغب في حجز موعد عبر واتساب")}
                >
                  <i className="fab fa-whatsapp text-xl"></i>
                  احجز موعد عبر واتساب
                </motion.a>
                
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2 relative pl-0 md:pl-8 lg:pl-12"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                {/* Image glow effect */}
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-tr from-blue-400 to-orange-400 opacity-20 blur-xl" />
                
                {/* Main image */}
                <Image 
                  src="/heroimage.png" 
                  alt="عيادة الريان المتخصصة" 
                  width={600} 
                  height={400}
                  className="relative rounded-2xl shadow-2xl w-full h-auto z-10 transform hover:scale-[1.01] transition duration-500"
                  priority
                />
                
                {/* Floating badge */}
                <motion.div 
                  className="absolute z-20 top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <span className="font-bold" style={{color: brandBlue}}>ترخيص وزارة الصحة: 211</span>
                </motion.div>
                
                {/* Floating status indicator */}
                <motion.div 
                  className="absolute z-20 -bottom-4 left-[10%] right-[10%] bg-white shadow-lg rounded-lg py-3 px-4 flex justify-between items-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <div className="flex items-center">
                    <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                      <Image 
                        src="/testimonia-4.webp" 
                        alt="عميل سعيد" 
                        width={32} 
                        height={32}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white" 
                      />
                      <Image 
                        src="/abd.webp" 
                        alt="عميل سعيد" 
                        width={32} 
                        height={32}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white" 
                      />
                      <Image 
                        src="/testimonial-2.webp" 
                        alt="عميل سعيد" 
                        width={32} 
                        height={32}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white" 
                      />
                    </div>
                    <span className="mr-2 text-gray-700 text-sm">+2.6K عميل سعيد</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700">متاح الآن</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">لماذا تختار عيادة نيو ريان للأسنان؟</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">نقدم أفضل خدمات طب الأسنان في الكويت من خلال فريق طبي متخصص وأحدث التقنيات والأجهزة الطبية (ترخيص وزارة الصحة رقم 211)</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center"
              variants={fadeIn}
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 bg-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: brandOrange}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">فريق طبي متخصص</h3>
              <p className="text-gray-600">نخبة من أطباء الأسنان المتخصصين ذوي الخبرة العالية في جميع مجالات طب الأسنان</p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center"
              variants={fadeIn}
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 bg-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: brandBlue}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">أحدث التقنيات</h3>
              <p className="text-gray-600">نستخدم أحدث التقنيات والأجهزة الطبية لضمان تشخيص دقيق وعلاج فعال وتجارب مريحة</p>
            </motion.div>
            
            <motion.div 
              className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center"
              variants={fadeIn}
              whileHover={{ y: -10 }}
            >
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 bg-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: `${brandOrange}`}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">رعاية خاصة للأطفال</h3>
              <p className="text-gray-600">نوفر رعاية خاصة للأطفال في بيئة مريحة ومطمئنة مع أطباء متخصصين في طب أسنان الأطفال</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onViewportEnter={() => {
              if (typeof window !== 'undefined' && (window as SnaptrWindow).snaptr) {
                const snaptr = (window as SnaptrWindow).snaptr;
                if (snaptr) {
                  snaptr('track', 'VIEW_CONTENT', {
                    'content_name': 'dental_services',
                    'content_category': 'dental_care'
                  });
                }
              }
            }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">خدماتنا المتميزة</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">نقدم مجموعة متكاملة من خدمات طب الأسنان العلاجية والتجميلية والوقائية لكافة الأعمار</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300"
                variants={fadeIn}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                  <i className={`${service.icon}`} style={{color: index % 2 === 0 ? brandOrange : brandBlue}}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Link href="#" className="font-medium flex items-center hover:opacity-80" style={{color: brandBlue}}>
                  اقرأ المزيد 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ms-1 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          
          {/* WhatsApp button under services */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">هل تحتاج إلى معلومات أكثر عن خدماتنا؟ تواصل معنا مباشرة للحصول على استشارة مجانية</p>
            <motion.a 
              href={buildWhatsAppUrl("مرحباً، أرغب في معرفة المزيد عن خدمات عيادة نيو ريان للأسنان")} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsAppClick("مرحباً، أرغب في حجز موعد عبر واتساب")}
            >
              <i className="fab fa-whatsapp text-xl"></i>
              تواصل معنا عبر واتساب
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">آراء مرضانا</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">استمع إلى تجارب مرضانا الحقيقية مع عيادتنا وفريقنا الطبي</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                className="testimonial-card bg-white p-6 rounded-lg shadow-md"
                variants={fadeIn}
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              >
                <div className="flex items-center mb-4">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    width={48} 
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="mr-4">
                    <h4 className="font-bold text-gray-800">{testimonial.name}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < testimonial.rating ? '' : 'text-gray-300'}`}></i>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{testimonial.text}</p>
                <div className="flex items-center">
                  <Image 
                    src="/google-icon.png" 
                    alt="Google" 
                    width={20} 
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="mr-2 text-sm text-gray-500">Google Reviews</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-12 text-center">
            <p className="text-center mb-6 max-w-2xl mx-auto">هل تحتاج إلى معلومات أكثر عن خدماتنا؟ تواصل معنا مباشرة للحصول على استشارة مجانية</p>
            <motion.a 
              href="#" 
              className="inline-flex items-center text-teal-600 font-medium hover:text-teal-700"
              whileHover={{ x: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              onClick={(e) => scrollToSection(e, 'testimonials')}
            >
              شاهد المزيد من التقييمات
              <i className="fas fa-arrow-left mr-2"></i>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 text-white" style={{background: `linear-gradient(135deg, ${brandOrange}, ${brandBlue})`}}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="text-4xl font-bold mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: {
                      duration: 0.5,
                      delay: index * 0.1
                    }
                  }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-teal-100">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">لماذا يثق بنا الآلاف من المرضى</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">استمع إلى تجارب حقيقية من مرضى وثقوا بنا وأصبحوا جزءًا من عائلتنا</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div 
              className="rounded-lg bg-teal-50 p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -10 }}
            >
              <div className="text-4xl font-bold mb-2" style={{color: brandOrange}}>98%</div>
              <p className="text-gray-700">من المرضى راضون عن خدماتنا</p>
            </motion.div>
            
            <motion.div 
              className="rounded-lg bg-teal-50 p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="text-4xl font-bold mb-2" style={{color: brandBlue}}>24/7</div>
              <p className="text-gray-700">متابعة ودعم طبي متواصل</p>
            </motion.div>
            
            <motion.div 
              className="rounded-lg bg-teal-50 p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -10 }}
            >
              <div className="text-4xl font-bold mb-2" style={{color: brandOrange}}>+2.6K</div>
              <p className="text-gray-700">حالة تم علاجها بنجاح</p>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-6 md:gap-12 items-center opacity-70"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.7 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center">
              <Image src="/partner-1.png" alt="شريك طبي" width={120} height={60} className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
            <div className="text-center">
              <Image src="/partner-2.png" alt="شريك طبي" width={120} height={60} className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
            <div className="text-center">
              <Image src="/partner-3.png" alt="شريك طبي" width={120} height={60} className="h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* WhatsApp CTA Section */}
      <section className="py-12" style={{background: brandBlue}}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="md:w-3/5">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">هل تحتاج إلى استشارة طبية لأسنانك؟</h2>
              <p className="text-lg opacity-90 mb-0">تواصل معنا عبر واتساب للحصول على استشارة سريعة أو حجز موعد فوري في عيادة نيو ريان للأسنان</p>
            </div>
                                      <motion.a 
              href={buildWhatsAppUrl("مرحباً، أرغب في حجز موعد في عيادة نيو ريان للأسنان")} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-300 text-lg font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsAppClick("مرحباً، أرغب في حجز موعد عبر واتساب")}
            >
              <i className="fab fa-whatsapp text-2xl"></i>
              تواصل عبر واتساب
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4">
                <Image src="/newrayan.png" alt="عيادة نيو ريان للأسنان" width={180} height={60} className="h-12 w-auto" />
              </div>
              <p className="text-gray-400 mb-4">نقدم خدمات طب الأسنان المتكاملة بأعلى معايير الجودة في الكويت (ترخيص وزارة الصحة رقم 211)</p>
              <div className="flex space-x-4 space-x-reverse">
                <motion.a 
                  href={buildWhatsAppUrl("مرحباً، أرغب في التواصل مع عيادة نيو ريان للأسنان")} 
                  className="text-gray-400 hover:text-green-500 transition duration-300"
                  whileHover={{ scale: 1.2 }}
                  onClick={handleWhatsAppClick("مرحباً، أرغب في التواصل مع عيادة نيو ريان للأسنان")}
                >
                  <i className="fab fa-whatsapp text-xl"></i>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-facebook transition duration-300"
                  whileHover={{ scale: 1.2 }}
                >
                  <i className="fab fa-facebook-f"></i>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-twitter transition duration-300"
                  whileHover={{ scale: 1.2 }}
                >
                  <i className="fab fa-twitter"></i>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-instagram transition duration-300"
                  whileHover={{ scale: 1.2 }}
                >
                  <i className="fab fa-instagram"></i>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-linkedin transition duration-300"
                  whileHover={{ scale: 1.2 }}
                >
                  <i className="fab fa-linkedin-in"></i>
                </motion.a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-gray-400 hover:text-white transition duration-300 flex items-center gap-2" onClick={(e) => scrollToSection(e, 'home')}>
                  <i className="fas fa-chevron-left text-xs"></i>الرئيسية
                </a></li>
                <li><a href="#services" className="text-gray-400 hover:text-white transition duration-300 flex items-center gap-2" onClick={(e) => scrollToSection(e, 'services')}>
                  <i className="fas fa-chevron-left text-xs"></i>خدماتنا
                </a></li>
                <li><a href="#doctors" className="text-gray-400 hover:text-white transition duration-300 flex items-center gap-2" onClick={(e) => scrollToSection(e, 'doctors')}>
                  <i className="fas fa-chevron-left text-xs"></i>فريقنا الطبي
                </a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white transition duration-300 flex items-center gap-2" onClick={(e) => scrollToSection(e, 'testimonials')}>
                  <i className="fas fa-chevron-left text-xs"></i>آراء المرضى
                </a></li>
                <li><a href="#appointment" className="text-gray-400 hover:text-white transition duration-300 flex items-center gap-2" onClick={(e) => scrollToSection(e, 'appointment')}>
                  <i className="fas fa-chevron-left text-xs"></i>احجز موعد
                </a></li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-4">ساعات العمل</h3>
              <ul className="space-y-2">
                <li className="flex justify-between text-gray-400">
                  <span>السبت - الأربعاء:</span>
                  <span>12:00 ظهراً - 8:00 مساءً</span>
                </li>
                <li className="flex justify-between text-gray-400">
                  <span>الخميس:</span>
                  <span>11:00 صباحاً - 7:00 مساءً</span>
                </li>
                <li className="flex justify-between text-gray-400">
                  <span>الجمعة:</span>
                  <span>مغلق</span>
                </li>
                <li className="mt-4">
                  <a 
                    href={buildWhatsAppUrl("مرحباً، أرغب في حجز موعد في عيادة نيو ريان للأسنان")} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 text-sm w-fit mt-2"
                    onClick={handleWhatsAppClick("مرحباً، أرغب في حجز موعد عبر واتساب")}
                  >
                    <i className="fab fa-whatsapp"></i>
                    احجز موعد عبر واتساب
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              id="contact"
            >
              <h3 className="text-xl font-bold mb-4">اتصل بنا</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <i className="fas fa-map-marker-alt mt-1 ml-3 text-teal-500"></i>
                  <div>
                    <span>34WH+JJC, Mangaf, Kuwait</span>
                    <br />
                    <a 
                      href="https://www.google.com/maps/place/New+rayan+clinic/@29.096565,48.129013,17z/data=!3m1!4b1!4m6!3m5!1s0x3fcf076f27f35877:0x3c5a895a65397331!8m2!3d29.096565!4d48.129013!16s%2Fg%2F11h3brf_x9?entry=ttu&g_ep=EgoyMDI1MDYwMS4wIKXMDSoASAFQAw%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-300 hover:text-teal-200 transition-colors"
                    >
                      اضغط للوصول عبر خرائط جوجل
                    </a>
                  </div>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-phone-alt mt-1 ml-3 text-teal-500"></i>
                  <div>
                    <a href="tel:+96566774402" className="hover:text-teal-300 transition-colors">66774402</a>
                  </div>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-envelope mt-1 ml-3 text-teal-500"></i>
                  <span><a href="mailto:info@new-rayan-dental.com" className="hover:text-teal-300 transition-colors">info@new-rayan-dental.com</a></span>
                </li>
              </ul>
            </motion.div>
          </div>
          <motion.div 
            className="border-t border-gray-700 mt-10 pt-6 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-gray-400">&copy; {new Date().getFullYear()} عيادة نيو ريان للأسنان - الكويت. جميع الحقوق محفوظة.</p>
          </motion.div>
        </div>
      </footer>

      {/* Social Proof Notification */}
      <SocialProofNotification />

      {/* Live Visitor Counter */}
      <motion.div
        className="fixed bottom-24 right-6 bg-white p-3 rounded-lg shadow-lg z-40 text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3, duration: 0.5 }}
      >
        <div className="flex items-center mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-gray-800 font-medium">{visitorCount} شخص يتصفح الآن</span>
        </div>
        <div className="flex items-center">
          <i className="fas fa-calendar-check text-blue-500 mr-2"></i>
          <span className="text-gray-800 font-medium">{bookedToday} حجز اليوم</span>
        </div>
        <div className="mt-3 text-center">
          <a 
            href={buildWhatsAppUrl("مرحباً، أرغب في حجز موعد قبل نفاذ المواعيد المتاحة")} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 inline-flex items-center"
            onClick={handleWhatsAppClick("مرحباً، أرغب في حجز موعد قبل نفاذ المواعيد المتاحة")}
          >
            <i className="fab fa-whatsapp mr-1"></i> احجز قبل نفاذ المواعيد
          </a>
        </div>
      </motion.div>

      {/* WhatsApp Floating Button */}
      <motion.a 
        href={buildWhatsAppUrl("مرحباً، أرغب في حجز موعد في عيادة نيو ريان للأسنان")} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 left-6 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleWhatsAppClick("مرحباً، أرغب في حجز موعد عبر واتساب")}
      >
        <i className="fab fa-whatsapp text-3xl"></i>
      </motion.a>

      {/* Back to Top Button */}
      <AnimatePresence>
        {backToTopVisible && (
          <motion.a 
            href="#" 
            className={`back-to-top fixed bottom-6 left-6 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition duration-300 ${backToTopVisible ? 'visible' : ''}`} style={{background: brandBlue}}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <i className="fas fa-arrow-up"></i>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}

// Services data
const services = [
  {
    icon: "fas fa-tooth",
    title: "تبييض الأسنان",
    description: "نقدم خدمات تبييض الأسنان المتطورة والآمنة للحصول على ابتسامة أكثر إشراقاً في جلسة واحدة"
  },
  {
    icon: "fas fa-smile",
    title: "ابتسامة هوليوود",
    description: "حول ابتسامتك لابتسامة المشاهير عبر قشور البورسلين وتقنيات التجميل المتقدمة"
  },
  {
    icon: "fas fa-teeth-open",
    title: "تقويم الأسنان",
    description: "تقويم الأسنان التقليدي والشفاف لمختلف الأعمار لتصحيح اصطفاف الأسنان وتحسين الإطباق"
  },
  {
    icon: "fas fa-x-ray",
    title: "زراعة الأسنان",
    description: "زراعة الأسنان بأحدث التقنيات لتعويض الأسنان المفقودة بنتائج طبيعية ودائمة"
  },
  {
    icon: "fas fa-baby",
    title: "طب أسنان الأطفال",
    description: "رعاية متخصصة لأسنان الأطفال في بيئة مريحة ومرحة تناسب احتياجاتهم الخاصة"
  },
  {
    icon: "fas fa-check-circle",
    title: "تركيبات الأسنان",
    description: "تيجان وجسور وتركيبات متحركة عالية الجودة تعيد جمال ووظيفة أسنانك"
  }
];

// Testimonials data
const testimonials = [
  {
    name: "عبدالله الخالد",
    rating: 5,
    text: "تجربتي مع عيادة نيو ريان للأسنان كانت ممتازة. قمت بعمل ابتسامة هوليوود والنتيجة مذهلة! الأطباء متخصصون والطاقم ودود. أنصح بشدة بزيارتهم.",
    image: "/abd.webp"
  },
  {
    name: "منى العتيبي",
    rating: 5,
    text: "قمت بعمل تقويم أسنان لابنتي في العيادة، وكانت تجربة مميزة. الدكتورة سارة رائعة مع الأطفال وتمتلك خبرة عالية. النتائج رائعة ونحن سعداء جداً.",
    image: "/testimonial-2.webp"
  },
  {
    name: "فهد المطيري",
    rating: 5,
    text: "أشكر الدكتور أحمد على الرعاية الممتازة في عملية زراعة الأسنان. لم أشعر بأي ألم والنتيجة طبيعية تماماً. عيادة نيو ريان من أفضل عيادات الأسنان في الكويت.",
    image: "/testimonial-3.webp"
  }
];

// Stats data
const stats = [
  { value: "+2.6K", label: "حالة تم علاجها بنجاح" },
  { value: "+15", label: "طبيب أسنان متخصص" },
  { value: "98%", label: "نسبة رضا المرضى" },
  { value: "+10", label: "سنوات من الخبرة" }
];

// Loading component for Suspense fallback
function LoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{borderColor: brandBlue, borderTopColor: 'transparent'}}></div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function Home() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <HomeContent />
    </Suspense>
  );
}
