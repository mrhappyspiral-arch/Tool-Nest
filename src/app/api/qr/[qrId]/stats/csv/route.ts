import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 統計CSV出力API
 * GET /api/qr/{qrId}/stats/csv?token=...&mode=month|all&year=YYYY&month=MM
 *
 * - mode=month: 指定年月の「日別アクセス数」を2行構成で出力
 *   1行目: 月日 (例: 1/1,1/2,...)
 *   2行目: アクセス数
 *
 * - mode=all: 全期間について、月ごとに上記2行＋空行を繰り返し出力
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    const { searchParams } = new URL(request.url);

    const token = searchParams.get('token');
    const mode = searchParams.get('mode') ?? 'month';
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month'); // 1-12

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // QRコードとトークンチェック
    const qrCode = await prisma.qrCode.findUnique({
      where: { id: qrId },
    });

    if (!qrCode || qrCode.manageToken !== token) {
      return NextResponse.json(
        { error: 'Not found or access denied' },
        { status: 404 }
      );
    }

    const utf8Bom = '\uFEFF';
    let csvLines: string[] = [];

    if (mode === 'all') {
      // 全期間のログを取得
      const logs = await prisma.qrScanLog.findMany({
        where: { qrId },
        select: { scannedAt: true },
        orderBy: { scannedAt: 'asc' },
      });

      if (logs.length === 0) {
        const emptyCsv = `${utf8Bom}データがありません`;
        return new NextResponse(emptyCsv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="qr-${qrId}-stats-all.csv"`,
          },
        });
      }

      // 年月ごとにグルーピング
      const monthlyMap = new Map<string, Date[]>();

      for (const log of logs) {
        const d = new Date(log.scannedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          '0'
        )}`;
        if (!monthlyMap.has(key)) {
          monthlyMap.set(key, []);
        }
        monthlyMap.get(key)!.push(d);
      }

      const sortedKeys = Array.from(monthlyMap.keys()).sort();

      for (const key of sortedKeys) {
        const [yearStr, monthStr] = key.split('-');
        const year = Number(yearStr);
        const monthIndex = Number(monthStr) - 1; // 0-11

        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        // 日別カウント
        const counts = new Array<number>(daysInMonth).fill(0);
        const dates = monthlyMap.get(key)!;

        for (const d of dates) {
          const day = d.getDate(); // 1-31
          counts[day - 1] += 1;
        }

        // 1行目: 月日
        const headerRow = Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          return `${Number(monthStr)}/${day}`;
        }).join(',');

        // 2行目: アクセス数
        const countRow = counts.join(',');

        csvLines.push(headerRow);
        csvLines.push(countRow);
        csvLines.push(''); // 1行空ける
      }
    } else {
      // 指定月のみ
      if (!yearParam || !monthParam) {
        return NextResponse.json(
          { error: 'year and month are required for month mode' },
          { status: 400 }
        );
      }

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

      const logs = await prisma.qrScanLog.findMany({
        where: {
          qrId,
          scannedAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        select: { scannedAt: true },
      });

      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const counts = new Array<number>(daysInMonth).fill(0);

      for (const log of logs) {
        const d = new Date(log.scannedAt);
        const day = d.getDate();
        counts[day - 1] += 1;
      }

      const headerRow = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return `${monthIndex + 1}/${day}`;
      }).join(',');

      const countRow = counts.join(',');

      csvLines.push(headerRow);
      csvLines.push(countRow);
    }

    const csv = utf8Bom + csvLines.join('\n');

    const filenameSuffix =
      mode === 'all'
        ? 'all'
        : `${yearParam ?? 'year'}-${monthParam ?? 'month'}`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="qr-${qrId}-stats-${filenameSuffix}.csv"`,
      },
    });
  } catch (error) {
    console.error('Stats CSV error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}


