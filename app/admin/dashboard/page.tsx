"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

interface ContactSubmission {
  id: string;
  name: string;
  phoneNumber: string;
  selectedService: string;
  message?: string;
  whatsappSent: boolean;
  whatsappSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

const serviceLabels: { [key: string]: string } = {
  "teeth-whitening": "تبييض الأسنان",
  "hollywood-smile": "ابتسامة هوليوود",
  "dental-implants": "زراعة الأسنان",
  "orthodontics": "تقويم الأسنان",
  "dental-crowns": "تركيبات الأسنان",
  "children-dentistry": "طب أسنان الأطفال",
  "root-canal": "علاج العصب",
  "gum-treatment": "علاج اللثة",
  "dental-cleaning": "تنظيف الأسنان",
  "consultation": "استشارة عامة",
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSubmissions();
    }
  }, [session]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/contact");
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (submission: ContactSubmission) => {
    const serviceLabel = serviceLabels[submission.selectedService] || submission.selectedService;
    
    const whatsappMessage = `مرحباً ${submission.name}،

شكراً لتواصلك مع عيادة نيو ريان للأسنان.

تفاصيل طلبك:
- الاسم: ${submission.name}
- رقم الهاتف: ${submission.phoneNumber}
- الخدمة المطلوبة: ${serviceLabel}
${submission.message ? `- رسالة إضافية: ${submission.message}` : ""}

سيتم التواصل معك قريباً لتحديد موعد مناسب.

عيادة نيو ريان للأسنان
الكويت - ترخيص وزارة الصحة رقم 211`;

    const whatsappUrl = `https://wa.me/${submission.phoneNumber.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");

    // Mark as sent
    markAsSent(submission.id);
  };

  const markAsSent = async (submissionId: string) => {
    setUpdatingIds(prev => new Set(prev).add(submissionId));
    
    try {
      const response = await fetch(`/api/contact/${submissionId}/whatsapp`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sent: true }),
      });

      if (response.ok) {
        setSubmissions(prev => 
          prev.map(sub => 
            sub.id === submissionId 
              ? { ...sub, whatsappSent: true, whatsappSentAt: new Date().toISOString() }
              : sub
          )
        );
      }
    } catch (error) {
      console.error("Error updating submission:", error);
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image 
                src="/newrayan.png" 
                alt="عيادة نيو ريان للأسنان" 
                width={150} 
                height={50} 
                className="h-10 w-auto" 
              />
              <div className="mr-4">
                <h1 className="text-xl font-bold text-gray-900">لوحة التحكم الإدارية</h1>
                <p className="text-sm text-gray-500">إدارة طلبات العملاء</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-sm text-gray-700">مرحباً، {session.user.name || session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div 
              className="bg-white overflow-hidden shadow rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-users text-blue-500 text-2xl"></i>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">إجمالي الطلبات</dt>
                      <dd className="text-lg font-medium text-gray-900">{submissions.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white overflow-hidden shadow rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fab fa-whatsapp text-green-500 text-2xl"></i>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">تم الرد عليها</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {submissions.filter(s => s.whatsappSent).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white overflow-hidden shadow rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="fas fa-clock text-orange-500 text-2xl"></i>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">في الانتظار</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {submissions.filter(s => !s.whatsappSent).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Submissions Table */}
          <motion.div 
            className="bg-white shadow overflow-hidden sm:rounded-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">طلبات العملاء</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                قائمة بجميع طلبات العملاء مع إمكانية الرد عبر واتساب
              </p>
            </div>
            
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-500">لا توجد طلبات بعد</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {submissions.map((submission, index) => (
                  <motion.li 
                    key={submission.id}
                    className="px-4 py-6 sm:px-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">{submission.name}</p>
                            {submission.whatsappSent && (
                              <span className="mr-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <i className="fab fa-whatsapp mr-1"></i>
                                تم الرد
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{formatDate(submission.createdAt)}</p>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <i className="fas fa-phone mr-2"></i>
                              {submission.phoneNumber}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:mr-6">
                              <i className="fas fa-tooth mr-2"></i>
                              {serviceLabels[submission.selectedService] || submission.selectedService}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            {submission.whatsappSent ? (
                              <span className="text-green-600 font-medium">
                                تم الرد {submission.whatsappSentAt && `في ${formatDate(submission.whatsappSentAt)}`}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleWhatsAppClick(submission)}
                                disabled={updatingIds.has(submission.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingIds.has(submission.id) ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    جاري الإرسال...
                                  </>
                                ) : (
                                  <>
                                    <i className="fab fa-whatsapp mr-2"></i>
                                    رد عبر واتساب
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        {submission.message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <strong>رسالة إضافية:</strong> {submission.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
