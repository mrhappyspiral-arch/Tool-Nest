/**
 * SafePic - TypeScript型定義
 */

export interface GPS {
  latitude: number;
  longitude: number;
}

export interface ExifData {
  // GPS情報
  gps?: GPS;
  
  // 撮影情報
  make?: string;           // カメラメーカー
  model?: string;          // カメラ機種名
  dateTime?: string;       // 撮影日時
  
  // 追加の詳細情報
  software?: string;       // 編集ソフトウェア
  orientation?: number;    // 画像の向き
  exposureTime?: number;   // 露出時間
  fNumber?: number;        // F値
  iso?: number;           // ISO感度
  focalLength?: number;   // 焦点距離
  
  // その他すべてのEXIFデータ
  raw?: Record<string, any>;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskAnalysis {
  level: RiskLevel;
  message: string;
  hasGPS: boolean;
  hasDeviceInfo: boolean;
  hasDateTime: boolean;
}

export interface FileState {
  file: File | null;
  preview?: string;
}

export interface ProcessingStatus {
  isAnalyzing: boolean;
  isRemoving: boolean;
  isComplete: boolean;
  error?: string;
}




