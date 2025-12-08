import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getRequestLocation, hashIp, parseUserAgent } from '@/lib/qr-utils';

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
    const scannedAt = new Date();

    const userAgentHeader = request.headers.get('user-agent');
    const userAgent = userAgentHeader || undefined;

    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
    const ipHash = hashIp(ip);

    const { deviceType, os, browser } = parseUserAgent(userAgentHeader);
    const { country, region, city } = await getRequestLocation(request, ip);

    // hour は日本時間（JST, UTC+9）の時を保存
    const jstHour = (scannedAt.getUTCHours() + 9) % 24;

    await prisma.qrScanLog.create({
      data: {
        qrId: qrCode.id,
        scannedAt,
        userAgent,
        ipHash,
        deviceType,
        os,
        browser,
        country,
        region,
        city,
        hour: jstHour,
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
