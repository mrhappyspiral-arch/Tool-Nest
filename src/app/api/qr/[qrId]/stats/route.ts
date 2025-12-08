import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getPublicUrl } from '@/lib/qr-utils';

// Node.js ランタイム（ファイルベースDB使用のため）
export const runtime = 'nodejs';

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

    // オプション: 特定の年月で日別集計を行う
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month'); // 1-12 を想定

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

    // 日付計算（デフォルトは今日基準の7日/14日集計）
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

    let daily: { date: string; count: number }[] = [];

    if (yearParam && monthParam) {
      // 特定の年月で日別集計
      const year = Number(yearParam);
      const monthIndex = Number(monthParam) - 1; // 0-11

      if (
        Number.isNaN(year) ||
        Number.isNaN(monthIndex) ||
        monthIndex < 0 ||
        monthIndex > 11
      ) {
        return NextResponse.json(
          { error: 'Invalid year or month' },
          { status: 400 }
        );
      }

      const monthStart = new Date(year, monthIndex, 1);
      const nextMonthStart = new Date(year, monthIndex + 1, 1);

      const monthLogs = await prisma.qrScanLog.findMany({
        where: {
          qrId,
          scannedAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        select: { scannedAt: true },
      });

      // 対象月の日数を算出
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const dailyMap: Record<string, number> = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        const dateStr = date.toISOString().split('T')[0];
        dailyMap[dateStr] = 0;
      }

      monthLogs.forEach((log) => {
        const scannedDate = new Date(log.scannedAt);
        const dateStr = scannedDate.toISOString().split('T')[0];
        if (dailyMap[dateStr] !== undefined) {
          dailyMap[dateStr]++;
        }
      });

      daily = Object.entries(dailyMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } else {
      // デフォルト: 過去14日分を日別集計
      const fourteenDaysAgo = new Date(todayStart);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const logs = await prisma.qrScanLog.findMany({
        where: {
          qrId,
          scannedAt: { gte: fourteenDaysAgo },
        },
        select: { scannedAt: true },
      });

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

      daily = Object.entries(dailyMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    const publicUrl = getPublicUrl(qrCode.id, request);

    return NextResponse.json({
      name: qrCode.name || '無題のQR',
      targetUrl: qrCode.targetUrl,
      publicUrl,
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
