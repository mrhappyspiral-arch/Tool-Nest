import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isValidUrl } from '@/lib/qr-utils';

/**
 * URL更新API
 * PATCH /api/qr/{qrId}/target
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    const body = await request.json();
    const { token, newTargetUrl } = body;

    // バリデーション
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!newTargetUrl) {
      return NextResponse.json(
        { error: 'newTargetUrl is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(newTargetUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // QRコードを検索
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: qrId },
    });

    // 見つからないか、トークンが一致しない場合は404
    if (!qrCode || qrCode.manageToken !== token) {
      return NextResponse.json(
        { error: 'Not found or access denied' },
        { status: 404 }
      );
    }

    // URLを更新
    const updated = await prisma.qrCode.update({
      where: { id: qrId },
      data: { targetUrl: newTargetUrl },
    });

    return NextResponse.json({
      success: true,
      targetUrl: updated.targetUrl,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update URL' },
      { status: 500 }
    );
  }
}
