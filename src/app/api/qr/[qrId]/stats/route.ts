import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getPublicUrl } from '@/lib/qr-utils';

/**
 * 統計取得API
 * GET /api/qr/{qrId}/stats?token={manageToken}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // tokenが必要
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
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

    // 日付計算
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 累計スキャン数
    const total = await prisma.qrScanLog.count({
      where: { qrId },
    });

    // 今日のスキャン数
    const today = await prisma.qrScanLog.count({
      where: {
        qrId,
        scannedAt: { gte: todayStart },
      },
    });

    // 過去7日のスキャン数
    const last7days = await prisma.qrScanLog.count({
      where: {
        qrId,
        scannedAt: { gte: sevenDaysAgo },
      },
    });

    // 日別スキャン数（過去14日）
    const fourteenDaysAgo = new Date(todayStart);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const logs = await prisma.qrScanLog.findMany({
      where: {
        qrId,
        scannedAt: { gte: fourteenDaysAgo },
      },
      select: { scannedAt: true },
    });

    // 日別に集計
    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 14; i++) {
      const date = new Date(todayStart);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }

    logs.forEach((log) => {
      const scannedDate = new Date(log.scannedAt);
      const dateStr = scannedDate.toISOString().split('T')[0];
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr]++;
      }
    });

    const daily = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      name: qrCode.name || '無題のQR',
      targetUrl: qrCode.targetUrl,
      publicUrl: getPublicUrl(qrCode.id),
      createdAt: new Date(qrCode.createdAt).toISOString(),
      today,
      last7days,
      total,
      daily,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
