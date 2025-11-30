import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  generateManageToken,
  generateQrId,
  getPublicUrl,
  getManageUrl,
  isValidUrl,
} from '@/lib/qr-utils';

// Node.js ランタイム（ファイルベースDB使用のため）
export const runtime = 'nodejs';

/**
 * QRコード作成API
 * POST /api/qr
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, targetUrl } = body;

    // バリデーション
    if (!targetUrl) {
      return NextResponse.json(
        { error: 'targetUrl is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(targetUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 管理トークンとIDを生成
    const manageToken = generateManageToken();
    const qrId = generateQrId();

    // DBにQRコードを作成
    const qrCode = await prisma.qrCode.create({
      data: {
        id: qrId,
        name: name || null,
        targetUrl,
        manageToken,
      },
    });

    // レスポンス（現在アクセスしているオリジンをベースURLとして使用）
    const publicUrl = getPublicUrl(qrCode.id, request);
    const manageUrl = getManageUrl(qrCode.id, manageToken, request);

    return NextResponse.json({
      qrId: qrCode.id,
      displayName: qrCode.name || '無題のQR',
      publicUrl,
      manageUrl,
    });
  } catch (error) {
    console.error('QR creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create QR code' },
      { status: 500 }
    );
  }
}
