import crypto from 'crypto';

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
 * ベースURLを取得
 */
export function getBaseUrl(): string {
  // 本番環境のURL
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Vercelデプロイ時
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // 開発環境
  return 'http://localhost:3001';
}

/**
 * 配布用URLを生成
 */
export function getPublicUrl(qrId: string): string {
  return `${getBaseUrl()}/q/${qrId}`;
}

/**
 * 管理用URLを生成
 */
export function getManageUrl(qrId: string, manageToken: string): string {
  return `${getBaseUrl()}/q/${qrId}/manage?token=${manageToken}`;
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
