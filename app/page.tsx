"use client";

import Image from "next/image";
import { useEffect, useState, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import { useSearchParams } from 'next/navigation';
import Clarity from '@microsoft/clarity';
import BeforeAfterSlider from './components/BeforeAfterSlider';

// New Modern Color Palette
const colors = {
  primary: "#1E3A5F", // Deep navy blue
  secondary: "#00D4AA", // Vibrant teal
  accent: "#FFD700", // Gold
  danger: "#FF6B6B", // Coral red
  light: "#F8FFFE", // Off white
  dark: "#0A1628", // Dark navy
  gradient1: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  gradient2: "linear-gradient(135deg, #00D4AA 0%, #1E3A5F 100%)",
  gradient3: "linear-gradient(135deg, #FFD700 0%, #FF6B6B 100%)"
};

// Enhanced animation variants

const floatingAnimation = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function HomeContent() {
  const [scrollY, setScrollY] = useState(0);
  const [backToTopVisible, setBackToTopVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [, setIsHydrated] = useState(false);
  const [showUrgencyBanner, setShowUrgencyBanner] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  
  const searchParams = useSearchParams();

  const buildWhatsAppUrl = useCallback((message: string) => {
    const base = 'https://wa.me/+96566774402';
    const text = encodeURIComponent(message);

    const utmSource = searchParams.get('utm_source');
    const utmCampaign = searchParams.get('utm_campaign');
    const gclid = searchParams.get('gclid');

    const params = [
      `text=${text}`,
      utmSource && `utm_source=${utmSource}`,
      utmCampaign && `utm_campaign=${utmCampaign}`,
      gclid && `gclid=${gclid}`,
    ].filter(Boolean);

    return `${base}?${params.join('&')}`;
  }, [searchParams]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsHydrated(true);
    
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const fbcParam = urlParams.get('fbc');
      const fbpParam = urlParams.get('fbp');
      
      if (fbcParam) {
        localStorage.setItem('_fbc', fbcParam);
        document.cookie = `_fbc=${fbcParam}; path=/; max-age=604800`;
      }
      
      if (fbpParam) {
        localStorage.setItem('_fbp', fbpParam);
        document.cookie = `_fbp=${fbpParam}; path=/; max-age=604800`;
      }
    }
  }, []);

  const scrollToSection = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    
    if (typeof window !== 'undefined') {
      try {
        Clarity.event('navigation_click');
        Clarity.setTag('navigation_target', sectionId);
      } catch (error) {
        console.log('Clarity tracking error:', error);
      }
    }
    
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    document.title = "عيادة نيو ريان | ابتسامة هوليوود في 7 أيام فقط - الكويت";
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setBackToTopVisible(window.scrollY > 500);
    };
    
    window.addEventListener("scroll", handleScroll);
    setIsLoaded(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{borderColor: colors.secondary, borderTopColor: 'transparent'}}></div>
    </div>;
  }

  // Tracking functions remain the same
  interface SnaptrWindow extends Window {
    snaptr?: (command: string, event: string, params?: Record<string, string>) => void;
  }

  interface GtagWindow extends Window {
    gtag?: (command: string, action: string, params?: Record<string, string | number | boolean | null>) => void;
    dataLayer?: unknown[];
    gtag_report_conversion?: (url?: string) => boolean;
  }

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

  const getMetaPixelParams = () => {
    let fbc = '';
    let fbp = '';
    
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      fbc = urlParams.get('fbc') || '';
      fbp = urlParams.get('fbp') || '';
      
      if (!fbc) fbc = localStorage.getItem('_fbc') || '';
      if (!fbp) fbp = localStorage.getItem('_fbp') || '';
      
      if (!fbc || !fbp) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === '_fbc' && !fbc) fbc = value;
          if (name === '_fbp' && !fbp) fbp = value;
        }
      }
      
      const fbqWindow = window as FbqWindow;
      if (!fbp && fbqWindow.fbq && fbqWindow.fbq.getState) {
        try {
          const pixelState = fbqWindow.fbq.getState();
          if (pixelState?.pixels?.['714361667908702']?.userData?._fbp) {
            const fbpFromPixel = pixelState.pixels['714361667908702'].userData._fbp;
            if (fbpFromPixel) {
              fbp = fbpFromPixel;
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

  const trackWhatsAppClick = () => {
    if (typeof window !== 'undefined') {
      try {
        Clarity.event('whatsapp_click');
        Clarity.setTag('conversion_action', 'whatsapp_contact');
      } catch (error) {
        console.log('Clarity tracking error:', error);
      }
    }

    if (typeof window !== 'undefined' && (window as SnaptrWindow).snaptr) {
      const snaptr = (window as SnaptrWindow).snaptr;
      if (snaptr) {
        snaptr('track', 'SIGN_UP', {
          'sign_up_method': 'WhatsApp',
        });
      }
    }

    if (typeof window !== 'undefined') {
      const gtagWindow = window as GtagWindow;
      if (gtagWindow.gtag) {
        gtagWindow.gtag('event', 'whatsapp_click_button', {
          'event_name': 'WhatsApp click button',
          'page_location': window.location.href
        });
      }
      
      if (gtagWindow.gtag_report_conversion) {
        gtagWindow.gtag_report_conversion();
      } else if (gtagWindow.gtag) {
        gtagWindow.gtag('event', 'conversion', {
          'send_to': 'AW-17159080860/r5f1CJzdktgaEJyXi_Y_'
        });
      }
    }

    if (typeof window !== 'undefined') {
      const fbqWindow = window as FbqWindow;
      if (fbqWindow.fbq) {
        fbqWindow.fbq('track', 'whatsapp_button');
      }

      const { fbc, fbp } = getMetaPixelParams();

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

  const handleWhatsAppClick = (message: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (typeof window !== 'undefined') {
      try {
        Clarity.event('whatsapp_message_click');
        Clarity.setTag('message_type', message.includes('موعد') ? 'appointment' : 'inquiry');
        Clarity.setTag('button_location', 'main_cta');
      } catch (error) {
        console.log('Clarity tracking error:', error);
      }
    }
    
    trackWhatsAppClick();
    const whatsappUrl = buildWhatsAppUrl(message);
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="font-[family-name:var(--font-tajawal)] bg-white text-right overflow-x-hidden">
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

      {/* Urgency Banner */}
      <AnimatePresence>
        {showUrgencyBanner && (
          <motion.div 
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 relative z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-4 mb-2 md:mb-0">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <i className="fas fa-fire text-2xl text-yellow-300"></i>
                </motion.div>
                <span className="font-bold text-lg">🎉 استشارة مجانية - ابتسامة هوليوود المتطورة</span>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <i className="fas fa-clock"></i>
                  <span className="font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <motion.a 
                href={buildWhatsAppUrl("أريد الاستفسار عن ابتسامة هوليوود!")} 
                className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick("أريد الاستفسار عن ابتسامة هوليوود!")}
              >
                احجز استشارة مجانية
              </motion.a>
              <button 
                onClick={() => setShowUrgencyBanner(false)}
                className="absolute top-2 left-2 text-white/70 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Sticky Header */}
      <motion.header 
        className="bg-white/90 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        style={{
          boxShadow: scrollY > 50 ? '0 10px 40px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
            >
              <Image 
                src="/newrayan.png" 
                alt="عيادة نيو ريان للأسنان" 
                width={180} 
                height={60} 
                className="h-12 w-auto" 
              />
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
              {[
                { href: "#hero", text: "الرئيسية", icon: "fas fa-home" },
                { href: "#transformation", text: "التحولات", icon: "fas fa-magic" },
                { href: "#services", text: "خدماتنا", icon: "fas fa-tooth" },
                { href: "#testimonials", text: "قصص النجاح", icon: "fas fa-star" },
                { href: "#offers", text: "العروض", icon: "fas fa-gift" }
              ].map((item, index) => (
                <motion.a 
                  key={index}
                  href={item.href} 
                  onClick={(e) => scrollToSection(e, item.href.substring(1))}
                  className="flex items-center gap-2 text-gray-700 hover:text-teal-600 font-medium transition-all duration-300 group"
                  whileHover={{ y: -2 }}
                >
                  <i className={`${item.icon} text-sm opacity-0 group-hover:opacity-100 transition-opacity`}></i>
                  <span>{item.text}</span>
                </motion.a>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button className="lg:hidden text-gray-700">
              <i className="fas fa-bars text-2xl"></i>
            </button>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <motion.a 
                href="tel:+96566774402"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-phone-alt animate-pulse"></i>
                <span>اتصل الآن</span>
              </motion.a>
              
              <motion.a 
                href={buildWhatsAppUrl("أريد حجز استشارة مجانية فورية!")} 
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick("أريد حجز استشارة مجانية فورية!")}
              >
                <motion.i 
                  className="fab fa-whatsapp text-xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                />
                <span>تواصل معنا</span>
              </motion.a>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Revolutionary Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-3xl"
            animate={{ 
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div 
              className="text-center lg:text-right space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Trust Badge */}
              <motion.div 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <i className="fas fa-award text-orange-500"></i>
                <span className="text-sm font-bold text-gray-700">مصنفة #1 في الكويت لتجميل الأسنان</span>
              </motion.div>

              <motion.h1 
                className="text-5xl lg:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ابتسامة هوليوود
                </span>
                <br />
                <span className="text-gray-800">في 7 أيام فقط!</span>
              </motion.h1>

              <motion.p 
                className="text-xl lg:text-2xl text-gray-600 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                انضم إلى <span className="font-bold text-teal-600">2,600+ شخص</span> حصلوا على ابتسامة أحلامهم معنا
              </motion.p>

              {/* Benefits List */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[
                  "✅ استشارة مجانية مع خطة علاج مفصلة",
                  "✅ نتائج مضمونة أو استرداد كامل المبلغ",
                  "✅ تقسيط مريح بدون فوائد حتى 12 شهر",
                  "✅ أحدث التقنيات الألمانية بدون ألم"
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-3 text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <span>{item}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
              <motion.a 
                href={buildWhatsAppUrl("أريد حجز استشارة مجانية لابتسامة هوليوود")} 
                className="group relative bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick("أريد حجز استشارة مجانية لابتسامة هوليوود")}
              >
                <motion.span 
                  className="absolute inset-0 bg-white/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative flex items-center gap-3">
                  <i className="fab fa-whatsapp text-2xl"></i>
                  احجز استشارتك المجانية الآن
                </span>
              </motion.a>

              <motion.a 
                href={buildWhatsAppUrl("أريد معرفة المزيد عن خدمات العيادة")} 
                className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick("أريد معرفة المزيد عن خدمات العيادة")}
              >
                <span className="relative flex items-center gap-3">
                  <i className="fab fa-whatsapp text-2xl"></i>
                  تواصل معنا الآن
                </span>
              </motion.a>
              </motion.div>

              {/* Social Proof */}
              <motion.div 
                className="flex items-center gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex -space-x-2 space-x-reverse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <Image src={`/testimonial-${i > 3 ? 1 : i}.webp`} alt="" width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">4.9/5 من 500+ تقييم</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image with Floating Elements */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-3xl blur-2xl"
                animate={pulseAnimation.animate}
              />
              
              <div className="relative">
                <Image 
                  src="/heroimage.png" 
                  alt="ابتسامة هوليوود - نتائج مذهلة" 
                  width={600} 
                  height={600}
                  className="rounded-3xl shadow-2xl w-full h-auto"
                  priority
                />
                
                {/* Floating Cards */}
                <motion.div 
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4"
                  animate={floatingAnimation.animate}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white"></i>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">ضمان النتيجة</p>
                      <p className="text-sm text-gray-600">مضمون تماماً</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute -bottom-4 -left-4 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-2xl shadow-xl p-4"
                  animate={floatingAnimation.animate}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold">🎁</p>
                    <p className="text-sm">استشارة مجانية!</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="absolute top-1/2 -left-8 bg-white rounded-full shadow-xl p-3"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <i className="fas fa-tooth text-2xl text-teal-500"></i>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transformation Gallery Section */}
      <section id="transformation" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="inline-block bg-gradient-to-r from-teal-100 to-blue-100 px-4 py-2 rounded-full text-teal-700 font-bold mb-4"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              نتائج حقيقية مضمونة
            </motion.span>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                شاهد التحول المذهل
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نتائج حقيقية لمرضى حقيقيين - كل هذه الحالات تمت في عيادتنا خلال 7 أيام فقط!
            </p>
          </motion.div>

          {/* Before/After Showcase */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <i className="fas fa-star"></i>
                  حالة رقم 1: ابتسامة هوليوود كاملة
                </h3>
              </div>
              <div className="p-4">
                <BeforeAfterSlider
                  beforeImage="/comparison/before.jpg"
                  afterImage="/comparison/after.jpg"
                  beforeAlt="قبل"
                  afterAlt="بعد"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">النتيجة:</p>
                    <p className="text-green-600">20 فينير بورسلين</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">المدة:</p>
                    <p className="text-blue-600">7 أيام فقط</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-r from-teal-500 to-green-500 text-white p-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <i className="fas fa-magic"></i>
                  حالة رقم 2: حشوات تجميلية
                </h3>
              </div>
              <div className="p-4">
                <BeforeAfterSlider
                  beforeImage="/comparison/before1.jpg"
                  afterImage="/comparison/after1.jpg"
                  beforeAlt="قبل"
                  afterAlt="بعد"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">النتيجة:</p>
                    <p className="text-green-600">تبييض 8 درجات</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">المدة:</p>
                    <p className="text-blue-600">جلسة واحدة</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Video Testimonial */}
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-2xl">
              <div className="bg-white rounded-2xl p-2">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/gjQvfncX2ng"
                    title="شهادات المرضى"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
            
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <p className="text-lg text-gray-600 mb-6">
                أكثر من 2,600 شخص غيروا حياتهم معنا - كن التالي!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a 
                  href={buildWhatsAppUrl("شاهدت النتائج وأريد حجز موعد للاستشارة")} 
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  onClick={handleWhatsAppClick("شاهدت النتائج وأريد حجز موعد للاستشارة")}
                >
                  <i className="fab fa-whatsapp text-2xl"></i>
                  احجز موعد استشارة
                </motion.a>
                <motion.a 
                  href={buildWhatsAppUrl("أريد معرفة تفاصيل أكثر عن العلاجات")} 
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  onClick={handleWhatsAppClick("أريد معرفة تفاصيل أكثر عن العلاجات")}
                >
                  <i className="fab fa-whatsapp text-2xl"></i>
                  تفاصيل العلاجات
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Revolutionary Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="inline-block bg-gradient-to-r from-blue-100 to-teal-100 px-6 py-3 rounded-full text-blue-700 font-bold mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              خدماتنا الطبية المتميزة
            </motion.span>
            <h2 className="text-4xl lg:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                حلول طبية متطورة لابتسامة مثالية
              </span>
            </h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              نقدم في عيادة نيو ريان مجموعة شاملة من الخدمات الطبية المتخصصة في طب وتجميل الأسنان، 
              باستخدام أحدث التقنيات العالمية وعلى أيدي فريق طبي متخصص ومتميز، 
              لضمان حصولك على أفضل النتائج وأعلى معايير الجودة والأمان.
            </motion.p>
            
            {/* Key Features */}
            <motion.div 
              className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-6 rounded-2xl border border-blue-100">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-certificate text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">معتمدون دولياً</h3>
                <p className="text-gray-600 text-sm">أطباء معتمدون من أفضل الجامعات العالمية</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-microscope text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">تقنيات متطورة</h3>
                <p className="text-gray-600 text-sm">أحدث الأجهزة الألمانية والأمريكية</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-shield-alt text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">ضمانات شاملة</h3>
                <p className="text-gray-600 text-sm">ضمان طويل المدى على جميع العلاجات</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enhancedServices.map((service, index) => (
              <motion.div
                key={index}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                {/* Professional Badge */}
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                  خدمة متميزة
                </div>
                
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${service.gradient}`}>
                    <i className={`${service.icon} text-2xl text-white`}></i>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Duration */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-lg font-bold text-blue-600">مدة العلاج</p>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{service.duration}</span>
                  </div>
                  
                  {/* CTA */}
                  <motion.a
                    href={buildWhatsAppUrl(`أريد الاستفسار عن ${service.title}`)}
                    className="block text-center bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-full font-bold group-hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    onClick={handleWhatsAppClick(`أريد الاستفسار عن ${service.title}`)}
                  >
                    احجز الآن
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with Stories */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="inline-block bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full text-yellow-700 font-bold mb-4"
            >
              قصص نجاح حقيقية
            </motion.span>
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                اسمع من مرضانا السعداء
              </span>
            </h2>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {enhancedTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-xl p-6 relative"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <i className="fas fa-quote-right text-white"></i>
                </div>
                
                {/* Rating */}
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                
                {/* Story */}
                <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.story}</p>
                
                {/* Result Badge */}
                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-3 mb-6">
                  <p className="text-sm font-bold text-green-700">النتيجة:</p>
                  <p className="text-green-600">{testimonial.result}</p>
                </div>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Google Reviews Badge */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-4 bg-white rounded-full shadow-lg px-8 py-4">
              <Image src="/google-icon.png" alt="Google" width={30} height={30} />
              <div className="text-right">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                <p className="text-sm text-gray-600">4.9 من 5 | 500+ تقييم</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-6 py-3 rounded-full mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <i className="fas fa-star text-yellow-300 text-2xl"></i>
              <span className="font-bold text-lg">لماذا نحن الأفضل؟</span>
            </motion.div>
            
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              معايير الجودة العالمية
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              نلتزم بأعلى معايير الجودة والسلامة لضمان حصولك على أفضل النتائج
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {whyChooseUs.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white text-gray-800 rounded-2xl p-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${feature.color}`}>
                    <i className={`${feature.icon} text-3xl text-white`}></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {feature.points.map((point, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <i className="fas fa-check text-green-500"></i>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.a
                  href={buildWhatsAppUrl(`أريد معرفة المزيد عن ${feature.title}`)}
                  className="block text-center bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-full font-bold"
                  whileHover={{ scale: 1.05 }}
                  onClick={handleWhatsAppClick(`أريد معرفة المزيد عن ${feature.title}`)}
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  اتصل بنا
                </motion.a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">الأسئلة الشائعة</h2>
            <p className="text-xl text-gray-600">إجابات لأكثر الأسئلة شيوعاً</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-md p-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <i className="fas fa-question-circle text-teal-500"></i>
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-600 mb-6">لديك سؤال آخر؟</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href={buildWhatsAppUrl("لدي استفسار عن خدمات العيادة")}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-3 rounded-full font-bold"
                  whileHover={{ scale: 1.05 }}
                  onClick={handleWhatsAppClick("لدي استفسار عن خدمات العيادة")}
                >
                  <i className="fab fa-whatsapp"></i>
                  تحدث معنا الآن
                </motion.a>
                <motion.a
                  href={buildWhatsAppUrl("أريد حجز موعد للفحص والاستشارة")}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-bold"
                  whileHover={{ scale: 1.05 }}
                  onClick={handleWhatsAppClick("أريد حجز موعد للفحص والاستشارة")}
                >
                  <i className="fab fa-whatsapp"></i>
                  احجز موعد فحص
                </motion.a>
              </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              لا تؤجل ابتسامتك المثالية!
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              احجز استشارتك المجانية الآن واحصل على خطة علاج مخصصة + هدية خاصة
            </p>
            
            <div className="bg-white/20 backdrop-blur rounded-2xl p-8 max-w-md mx-auto mb-8">
              <p className="text-2xl font-bold mb-4">🎁 استشارة شاملة مجانية تشمل:</p>
              <ul className="space-y-2 text-right">
                <li>✓ فحص شامل بالأشعة ثلاثية الأبعاد</li>
                <li>✓ خطة علاج مفصلة ومخصصة</li>
                <li>✓ استشارة طبية متخصصة</li>
                <li>✓ تقييم حالة الأسنان واللثة</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href={buildWhatsAppUrl("أريد حجز الاستشارة المجانية الشاملة")}
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-full font-bold text-xl shadow-2xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick("أريد حجز الاستشارة المجانية الشاملة")}
              >
                <motion.i 
                  className="fab fa-whatsapp text-3xl text-green-500"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                />
                احجز استشارة مجانية
              </motion.a>
              <motion.a
                href={buildWhatsAppUrl("أريد التحدث مع طبيب مختص الآن")}
                className="inline-flex items-center gap-3 bg-green-500 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick("أريد التحدث مع طبيب مختص الآن")}
              >
                <motion.i 
                  className="fab fa-whatsapp text-3xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                />
                تحدث مع طبيب
              </motion.a>
            </div>
            
            <p className="mt-6 text-sm opacity-75">
              * الاستشارة مجانية تماماً وبدون التزام
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Image src="/newrayan.png" alt="عيادة نيو ريان" width={150} height={50} className="mb-4" />
              <p className="text-gray-400 mb-4">
                رواد طب الأسنان التجميلي في الكويت
              </p>
              <div className="flex gap-4">
                {['facebook', 'instagram', 'twitter', 'youtube'].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-500 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <i className={`fab fa-${social}`}></i>
                  </motion.a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">خدماتنا</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors">ابتسامة هوليوود</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">زراعة الأسنان</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">تقويم الأسنان</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">تبييض الأسنان</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">ساعات العمل</h3>
              <ul className="space-y-2 text-gray-400">
                <li>السبت - الأربعاء: 12-8 مساءً</li>
                <li>الخميس: 11-7 مساءً</li>
                <li>الجمعة: مغلق</li>
                <li className="text-green-400 font-bold">متاح للتواصل 24/7</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">تواصل معنا</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <i className="fas fa-phone text-teal-400"></i>
                  <a href="tel:+96566774402" className="hover:text-teal-400">66774402</a>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-map-marker-alt text-teal-400"></i>
                  <span>المنقف، الكويت</span>
                </li>
                <li>
                  <div className="flex flex-col gap-2">
                    <motion.a
                      href={buildWhatsAppUrl("أريد التواصل مع العيادة")}
                      className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold"
                      whileHover={{ scale: 1.05 }}
                      onClick={handleWhatsAppClick("أريد التواصل مع العيادة")}
                    >
                      <i className="fab fa-whatsapp"></i>
                      تواصل معنا
                    </motion.a>
                    <motion.a
                      href={buildWhatsAppUrl("أريد حجز موعد طوارئ")}
                      className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold"
                      whileHover={{ scale: 1.05 }}
                      onClick={handleWhatsAppClick("أريد حجز موعد طوارئ")}
                    >
                      <i className="fas fa-ambulance"></i>
                      طوارئ
                    </motion.a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 عيادة نيو ريان للأسنان. جميع الحقوق محفوظة | ترخيص وزارة الصحة رقم 211</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp with Pulse */}
      <motion.div
        className="fixed bottom-8 left-8 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <motion.a
          href={buildWhatsAppUrl("أريد التواصل مع عيادة نيو ريان")}
          className="relative block"
          whileHover={{ scale: 1.1 }}
          onClick={handleWhatsAppClick("أريد التواصل مع عيادة نيو ريان")}
        >
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.3, 1.3], opacity: [0.7, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1.2], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          
          {/* Button */}
          <div className="relative w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
            <i className="fab fa-whatsapp text-3xl text-white"></i>
          </div>
          
          {/* Badge */}
          <motion.div
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            متاح الآن
          </motion.div>
        </motion.a>
      </motion.div>

      {/* Back to Top */}
      <AnimatePresence>
        {backToTopVisible && (
          <motion.button
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-xl z-40"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <i className="fas fa-arrow-up"></i>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Enhanced Services Data
const enhancedServices = [
  {
    icon: "fas fa-crown",
    title: "ابتسامة هوليوود الاحترافية",
    description: "تحويل شامل لابتسامتك باستخدام أحدث تقنيات الفينير العالمية",
    gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
    features: [
      "فينير إيماكس الألماني - أقوى وأجمل المواد",
      "تصميم رقمي ثلاثي الأبعاد للابتسامة المثالية",
      "تقنية Prep-less بدون برد أو ألم",
      "ضمان 10 سنوات مع متابعة دورية مجانية"
    ],
    duration: "5-7 أيام عمل"
  },
  {
    icon: "fas fa-sun",
    title: "التبييض الضوئي المتقدم",
    description: "تبييض فوري وآمن يحافظ على صحة أسنانك مع نتائج تدوم سنوات",
    gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    features: [
      "تقنية Zoom الأمريكية - الأكثر أماناً عالمياً",
      "تبييض 6-8 درجات في جلسة واحدة",
      "حماية كاملة للثة والأسنان الحساسة",
      "جل تبييض منزلي مجاني للمحافظة على النتيجة"
    ],
    duration: "جلسة واحدة 60 دقيقة"
  },
  {
    icon: "fas fa-tooth",
    title: "الزراعة الفورية المتطورة",
    description: "استبدال الأسنان المفقودة بزراعات تدوم مدى الحياة في نفس اليوم",
    gradient: "bg-gradient-to-r from-green-500 to-teal-500",
    features: [
      "زراعات نوبل بايوكير السويسرية الأصلية",
      "تقنية الجراحة الموجهة بالكمبيوتر",
      "تركيب فوري للتاج المؤقت في نفس الجلسة",
      "ضمان مدى الحياة على الزراعة"
    ],
    duration: "جلسة واحدة 2-3 ساعات"
  },
  {
    icon: "fas fa-child",
    title: "عيادة الأطفال المتخصصة",
    description: "رعاية طبية شاملة لأسنان الأطفال في بيئة مرحة وآمنة",
    gradient: "bg-gradient-to-r from-yellow-500 to-orange-500",
    features: [
      "أطباء متخصصون في طب أسنان الأطفال",
      "تقنيات العلاج بدون ألم أو خوف",
      "برامج الوقاية والتثقيف للأطفال والأهل",
      "هدايا وجوائز تشجيعية لكل زيارة"
    ],
    duration: "30-45 دقيقة"
  },
  {
    icon: "fas fa-align-center",
    title: "التقويم الشفاف الذكي",
    description: "تعديل الأسنان بتقنية غير مرئية مع متابعة رقمية متطورة",
    gradient: "bg-gradient-to-r from-purple-500 to-indigo-500",
    features: [
      "تقنية إنفيزالاين الأمريكية الأصلية",
      "تصميم ثلاثي الأبعاد يظهر النتيجة النهائية مسبقاً",
      "قوالب شفافة قابلة للإزالة والتنظيف",
      "تطبيق ذكي لمتابعة التقدم والتذكير"
    ],
    duration: "6-24 شهر حسب الحالة"
  },
  {
    icon: "fas fa-shield-alt",
    title: "علاج الجذور الميكروسكوبي",
    description: "إنقاذ الأسنان بتقنية الميكروسكوب الألماني عالي الدقة",
    gradient: "bg-gradient-to-r from-red-500 to-pink-500",
    features: [
      "ميكروسكوب كارل زايس الألماني للدقة القصوى",
      "تقنية الروتاري لتنظيف وتعقيم مثالي",
      "حشو الجذور بمواد بيوسيراميك المتطورة",
      "نسبة نجاح 98% مع ضمان 5 سنوات"
    ],
    duration: "جلسة واحدة 90 دقيقة"
  }
];

// Enhanced Testimonials
const enhancedTestimonials = [
  {
    name: "سارة المطيري",
    image: "/testimonia-4.webp",
    rating: 5,
    story: "كنت أخجل من ابتسامتي لسنوات.. اليوم أصبحت عارضة أزياء بفضل ابتسامة هوليوود من عيادة نيو ريان!",
    result: "20 فينير في 7 أيام",
    date: "قبل أسبوع"
  },
  {
    name: "أحمد الخالدي",
    image: "/abd.webp",
    rating: 5,
    story: "فقدت أسناني الأمامية في حادث.. الدكتور أعاد لي الثقة بزراعة فورية في نفس اليوم!",
    result: "4 زراعات فورية",
    date: "قبل شهر"
  },
  {
    name: "نورا العنزي",
    image: "/testimonial-2.webp",
    rating: 5,
    story: "ابنتي كانت تبكي من طبيب الأسنان.. هنا أصبحت تطلب الذهاب للعيادة! الفريق رائع مع الأطفال",
    result: "علاج كامل للطفل",
    date: "قبل أسبوعين"
  }
];

// Why Choose Us Data
const whyChooseUs = [
  {
    title: "خبرة وتميز طبي",
    description: "فريق من أفضل أطباء الأسنان في الكويت",
    icon: "fas fa-user-md",
    color: "bg-gradient-to-r from-blue-500 to-indigo-500",
    points: [
      "أطباء معتمدون دولياً",
      "خبرة تزيد عن 15 عام",
      "تدريب مستمر على أحدث التقنيات",
      "شهادات من أفضل الجامعات العالمية"
    ]
  },
  {
    title: "تقنيات متطورة",
    description: "أحدث الأجهزة والتقنيات الطبية العالمية",
    icon: "fas fa-microscope",
    color: "bg-gradient-to-r from-green-500 to-emerald-500",
    points: [
      "أجهزة ألمانية وأمريكية متطورة",
      "تقنية الليزر المتقدمة",
      "أشعة ثلاثية الأبعاد",
      "معقمة بأعلى المعايير العالمية"
    ]
  },
  {
    title: "راحة وأمان المريض",
    description: "نضع راحة وسلامة مرضانا في المقدمة",
    icon: "fas fa-shield-check",
    color: "bg-gradient-to-r from-purple-500 to-pink-500",
    points: [
      "بيئة معقمة وآمنة تماماً",
      "تخدير متطور بدون ألم",
      "متابعة مستمرة بعد العلاج",
      "ضمانات شاملة على جميع العلاجات"
    ]
  }
];

// FAQs
const faqs = [
  {
    question: "هل العلاج مؤلم؟",
    answer: "نستخدم أحدث تقنيات التخدير الموضعي وأجهزة بدون ألم. معظم مرضانا لم يشعروا بأي ألم خلال العلاج."
  },
  {
    question: "كم تستغرق ابتسامة هوليوود؟",
    answer: "فقط 7 أيام من الاستشارة حتى التركيب النهائي. نضمن لك النتيجة أو نعيد لك المبلغ كاملاً."
  },
  {
    question: "هل يوجد تقسيط؟",
    answer: "نعم، نوفر تقسيط مريح حتى 12 شهر بدون فوائد وبدون دفعة أولى لبعض الخدمات."
  },
  {
    question: "ما هي ضماناتكم؟",
    answer: "نقدم ضمان طويل المدى على الفينير ومدى الحياة على الزراعات. كما نضمن رضاك التام."
  },
  {
    question: "هل تستقبلون حالات الطوارئ؟",
    answer: "نعم، لدينا خط ساخن للتواصل 24/7 لحالات الطوارئ ونستقبل الحالات الطارئة فوراً."
  }
];

// Loading component
function LoadingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <i className="fas fa-tooth text-6xl text-teal-500"></i>
      </motion.div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <HomeContent />
    </Suspense>
  );
}
