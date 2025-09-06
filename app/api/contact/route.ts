import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phoneNumber, selectedService, message } = body;

    // Validate required fields
    if (!name || !phoneNumber || !selectedService) {
      return NextResponse.json(
        { error: 'الاسم ورقم الهاتف والخدمة المطلوبة مطلوبة' },
        { status: 400 }
      );
    }

    // Create contact submission in database
    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        selectedService,
        message: message?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      id: submission.id,
      message: 'تم إرسال النموذج بنجاح'
    });

  } catch (error) {
    console.error('Error creating contact submission:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint is for admin dashboard to fetch submissions
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
