import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const { sent } = await request.json();
    const resolvedParams = await params;
    const submissionId = resolvedParams.id;

    // Update the submission
    const updatedSubmission = await prisma.contactSubmission.update({
      where: {
        id: submissionId,
      },
      data: {
        whatsappSent: sent,
        whatsappSentAt: sent ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    });

  } catch (error) {
    console.error('Error updating WhatsApp status:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
