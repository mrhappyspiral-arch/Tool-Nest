/**
 * QR Tracker 関連の型定義
 */

// QR作成APIのレスポンス
export interface QrCreateResponse {
  qrId: string;
  displayName: string;
  publicUrl: string;
  manageUrl: string;
}

// 統計APIのレスポンス
export interface QrStatsResponse {
  name: string;
  targetUrl: string;
  publicUrl: string;
  createdAt: string;
  today: number;
  last7days: number;
  total: number;
  daily: DailyCount[];
}

// 日別カウント
export interface DailyCount {
  date: string;
  count: number;
}

// URL更新APIのレスポンス
export interface QrUpdateResponse {
  success: boolean;
  targetUrl: string;
  updatedAt: string;
}

// エラーレスポンス
export interface ApiError {
  error: string;
}


