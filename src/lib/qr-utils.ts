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
 * Vercel が付与するヘッダーから大まかな地域情報を取得
 */
export function getRequestLocation(request: NextRequest): {
  country?: string;
  region?: string;
  city?: string;
} {
  const country = request.headers.get('x-vercel-ip-country') || undefined;
  const region = request.headers.get('x-vercel-ip-country-region') || undefined;
  const city = request.headers.get('x-vercel-ip-city') || undefined;

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
