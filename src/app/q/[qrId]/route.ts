import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashIp } from '@/lib/qr-utils';

// Node.js ランタイム（ファイルベースDB使用のため）
export const runtime = 'nodejs';

/**
 * リダイレクト＆トラッキング
 * GET /q/{qrId}
 * 
 * QRコードからアクセスした際に:
 * 1. スキャンログを記録
 * 2. ターゲットURLに302リダイレクト
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;

    // QRコードを検索
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: qrId },
    });

    // 見つからない場合は404
    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found' },
        { status: 404 }
      );
    }

    // スキャンログを記録
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    const ipHash = hashIp(ip);

    await prisma.qrScanLog.create({
      data: {
        qrId: qrCode.id,
        userAgent,
        ipHash,
      },
    });

    // ターゲットURLに302リダイレクト
    return NextResponse.redirect(qrCode.targetUrl, 302);
  } catch (error) {
    console.error('Redirect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
