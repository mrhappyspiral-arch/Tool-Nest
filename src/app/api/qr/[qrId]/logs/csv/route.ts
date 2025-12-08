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
      const row = [
        new Date(log.scannedAt).toISOString(),
        log.deviceType ?? '',
        log.os ?? '',
        log.browser ?? '',
        log.country ?? '',
        log.region ?? '',
        log.city ?? '',
        log.hour ?? '',
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


