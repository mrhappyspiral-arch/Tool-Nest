import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 生ログCSV出力API（1行1アクセス）
 * GET /api/qr/{qrId}/logs/csv?token=...
 *
 * 1行目: ヘッダー
 * 2行目以降: 各アクセス1行
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrId: string }> }
) {
  try {
    const { qrId } = await params;
    const { searchParams } = new URL(request.url);

    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const qrCode = await prisma.qrCode.findUnique({
      where: { id: qrId },
    });

    if (!qrCode || qrCode.manageToken !== token) {
      return NextResponse.json(
        { error: 'Not found or access denied' },
        { status: 404 }
      );
    }

    const logs = await prisma.qrScanLog.findMany({
      where: { qrId },
      orderBy: { scannedAt: 'asc' },
      select: {
        scannedAt: true,
        deviceType: true,
        os: true,
        browser: true,
        country: true,
        region: true,
        city: true,
        hour: true,
        userAgent: true,
      },
    });

    const utf8Bom = '\uFEFF';

    const escape = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const toJstStringAndHour = (date: Date): { datetime: string; hour: number } => {
      const d = new Date(date);
      // UTC から 9時間加算して JST に変換
      const jstMs = d.getTime() + 9 * 60 * 60 * 1000;
      const jst = new Date(jstMs);

      const pad = (n: number) => String(n).padStart(2, '0');

      const year = jst.getUTCFullYear();
      const month = pad(jst.getUTCMonth() + 1);
      const day = pad(jst.getUTCDate());
      const hour = jst.getUTCHours();
      const minute = pad(jst.getUTCMinutes());
      const second = pad(jst.getUTCSeconds());

      return {
        datetime: `${year}-${month}-${day} ${pad(hour)}:${minute}:${second}`,
        hour,
      };
    };

    const header = [
      'scannedAt',
      'deviceType',
      'os',
      'browser',
      'country',
      'region',
      'city',
      'hour',
      'userAgent',
    ].join(',');

    const lines = logs.map((log) => {
      const { datetime, hour } = toJstStringAndHour(log.scannedAt);

      const row = [
        datetime, // 日本時間（JST）での日時
        log.deviceType ?? '',
        log.os ?? '',
        log.browser ?? '',
        log.country ?? '',
        log.region ?? '',
        log.city ?? '',
        hour, // 日本時間での時（0-23）
        log.userAgent ?? '',
      ].map(escape);

      return row.join(',');
    });

    const csv =
      utf8Bom + [header, ...lines].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="qr-${qrId}-logs.csv"`,
      },
    });
  } catch (error) {
    console.error('Logs CSV error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}


