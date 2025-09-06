"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ContactFormProps {
  onSubmit?: (data: FormData) => void;
}

interface FormData {
  name: string;
  phoneNumber: string;
  selectedService: string;
  message?: string;
}

const dentalServices = [
  { value: "teeth-whitening", label: "تبييض الأسنان" },
  { value: "hollywood-smile", label: "ابتسامة هوليوود" },
  { value: "dental-implants", label: "زراعة الأسنان" },
  { value: "orthodontics", label: "تقويم الأسنان" },
  { value: "dental-crowns", label: "تركيبات الأسنان" },
  { value: "children-dentistry", label: "طب أسنان الأطفال" },
  { value: "root-canal", label: "علاج العصب" },
  { value: "gum-treatment", label: "علاج اللثة" },
  { value: "dental-cleaning", label: "تنظيف الأسنان" },
  { value: "consultation", label: "استشارة عامة" },
];

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phoneNumber: "",
    selectedService: "",
    message: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    } else {
      // Clean the phone number (remove spaces, dashes, etc.)
      const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, "");
      
      // Kuwait phone number validation - accepts multiple formats:
      // +96512345678, 96512345678, 012345678, 12345678
      const kuwaitPhoneRegex = /^(\+965|965|0)?[1-9][0-9]{7}$/;
      
      if (!kuwaitPhoneRegex.test(cleanPhone)) {
        newErrors.phoneNumber = "رقم الهاتف غير صحيح (مثال: 99123456 أو 96599123456)";
      }
    }

    if (!formData.selectedService) {
      newErrors.selectedService = "يرجى اختيار الخدمة المطلوبة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to API
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Create WhatsApp message
        const selectedServiceLabel = dentalServices.find(
          (service) => service.value === formData.selectedService
        )?.label || formData.selectedService;

        // Normalize phone number for display
        const cleanPhone = formData.phoneNumber.replace(/[\s\-\(\)]/g, "");
        let displayPhone = cleanPhone;
        
        // Add +965 if not present and format for display
        if (cleanPhone.startsWith("+965")) {
          displayPhone = cleanPhone;
        } else if (cleanPhone.startsWith("965")) {
          displayPhone = `+${cleanPhone}`;
        } else if (cleanPhone.startsWith("0")) {
          displayPhone = `+965${cleanPhone.substring(1)}`;
        } else if (cleanPhone.length === 8) {
          displayPhone = `+965${cleanPhone}`;
        }

        const whatsappMessage = `مرحباً، أنا ${formData.name}
رقم الهاتف: ${displayPhone}
الخدمة المطلوبة: ${selectedServiceLabel}
${formData.message ? `رسالة إضافية: ${formData.message}` : ""}

أرغب في حجز موعد في عيادة نيو ريان للأسنان.`;

        // Redirect to WhatsApp
        const whatsappUrl = `https://wa.me/+96566774402?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, "_blank");

        // Reset form
        setFormData({
          name: "",
          phoneNumber: "",
          selectedService: "",
          message: "",
        });

        // Call parent onSubmit if provided
        if (onSubmit) {
          onSubmit(formData);
        }
      } else {
        throw new Error("فشل في إرسال النموذج");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("حدث خطأ في إرسال النموذج. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <motion.div
      className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">احجز موعدك الآن</h3>
        <p className="text-gray-600">املأ النموذج وسيتم تحويلك لواتساب لتأكيد الموعد</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            الاسم الكامل *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="أدخل اسمك الكامل"
            dir="rtl"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone Number Field */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            رقم الهاتف *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="مثال: 99123456 أو 96599123456 أو 099123456"
            dir="ltr"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Service Selection */}
        <div>
          <label htmlFor="selectedService" className="block text-sm font-medium text-gray-700 mb-1">
            الخدمة المطلوبة *
          </label>
          <select
            id="selectedService"
            name="selectedService"
            value={formData.selectedService}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.selectedService ? "border-red-500" : "border-gray-300"
            }`}
            dir="rtl"
          >
            <option value="">اختر الخدمة المطلوبة</option>
            {dentalServices.map((service) => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
          {errors.selectedService && (
            <p className="text-red-500 text-sm mt-1">{errors.selectedService}</p>
          )}
        </div>

        {/* Optional Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            رسالة إضافية (اختياري)
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="أي تفاصيل إضافية تود إضافتها..."
            dir="rtl"
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري الإرسال...
            </>
          ) : (
            <>
              <i className="fab fa-whatsapp text-xl"></i>
              أرسل عبر واتساب
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          بالضغط على &quot;أرسل عبر واتساب&quot; ستتم إعادة توجيهك لواتساب مع بياناتك
        </p>
      </div>
    </motion.div>
  );
}
