import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { UAParser } from 'ua-parser-js';

/**
 * 管理用トークンを生成（32文字以上のランダム文字列）
 */
export function generateManageToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64文字
}

/**
 * QR IDを生成（UUID形式）
 * Node.js 14.17.0以降で利用可能なcrypto.randomUUID()を使用
 */
export function generateQrId(): string {
  return crypto.randomUUID();
}

/**
 * IPアドレスをハッシュ化（匿名化）
 */
export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

/**
 * User-Agent 文字列から端末種別・OS・ブラウザを抽出
 */
export function parseUserAgent(ua?: string | null): {
  deviceType?: string;
  os?: string;
  browser?: string;
} {
  if (!ua) return {};

  const parser = new UAParser(ua);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();

  // 端末種別（desktop / mobile / tablet / その他）
  let deviceType: string | undefined;
  if (device.type) {
    deviceType = device.type;
  } else {
    // type が取れない場合は UA から簡易判定
    if (/mobile/i.test(ua)) {
      deviceType = 'mobile';
    } else if (/tablet/i.test(ua)) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }
  }

  return {
    deviceType,
    os: os.name || undefined,
    browser: browser.name || undefined,
  };
}

/**
 * 大まかな地域情報を取得
 *
 * - まず Vercel が付与するヘッダーから取得
 * - region / city が取れない場合は、IPベースの簡易GeoIP APIで補完
 */
export async function getRequestLocation(
  request: NextRequest,
  ip: string
): Promise<{
  country?: string;
  region?: string;
  city?: string;
}> {
  let country =
    request.headers.get('x-vercel-ip-country') || undefined;

  // リージョンはヘッダー名の違いに備えて複数パターンを確認
  let region =
    request.headers.get('x-vercel-ip-country-region') ||
    request.headers.get('x-vercel-ip-region') ||
    undefined;

  let city =
    request.headers.get('x-vercel-ip-city') || undefined;

  // すでにすべて取得できていれば API 呼び出しは不要
  const needsLookup = !region || !city;

  if (
    needsLookup &&
    ip &&
    ip !== 'unknown' &&
    !ip.startsWith('127.') &&
    ip !== '::1'
  ) {
    try {
      // 外部の簡易GeoIPサービスで地域情報を補完（大体の地域）
      const res = await fetch(
        `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
        {
          // キャッシュして呼び出し回数を抑える
          next: { revalidate: 60 * 60 * 24 },
        }
      );

      if (res.ok) {
        const data: {
          country_code?: string;
          region?: string;
          region_code?: string;
          city?: string;
        } = await res.json();

        if (!country && data.country_code) {
          country = data.country_code;
        }
        if (!region && (data.region || data.region_code)) {
          region = data.region || data.region_code || undefined;
        }
        if (!city && data.city) {
          city = data.city;
        }
      }
    } catch (error) {
      console.error('GeoIP lookup failed:', error);
    }
  }

  return { country, region, city };
}

/**
 * ベースURLを取得
 *
 * - ブラウザ: window.location.origin
 * - APIルートなど: NextRequest.nextUrl.origin
 * - それ以外: NEXT_PUBLIC_BASE_URL / VERCEL_URL / ローカルデフォルト
 */
export function getBaseUrl(request?: NextRequest): string {
  // クライアントサイド（ブラウザ）では常に現在のオリジンを使う
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  // APIルートなどのサーバー側
  if (request) {
    return request.nextUrl.origin;
  }

  // 明示的に設定されたベースURL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Vercelデプロイ時の自動ドメイン
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // ローカル開発
  return 'http://localhost:3001';
}

/**
 * 配布用URLを生成
 */
export function getPublicUrl(qrId: string, request?: NextRequest): string {
  return `${getBaseUrl(request)}/q/${qrId}`;
}

/**
 * 管理用URLを生成
 */
export function getManageUrl(
  qrId: string,
  manageToken: string,
  request?: NextRequest
): string {
  return `${getBaseUrl(request)}/q/${qrId}/manage?token=${manageToken}`;
}

/**
 * URL形式のバリデーション
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
