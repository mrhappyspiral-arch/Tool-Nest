/**
 * SafePic - EXIF処理コアロジック
 * すべての処理はクライアントサイドで完結します
 */

import * as exifr from 'exifr';
import type { ExifData, GPS, RiskAnalysis, RiskLevel } from '@/types';

/**
 * 画像ファイルからEXIF情報を解析
 * @param file - 解析する画像ファイル
 * @returns ExifData - 解析されたEXIFデータ
 */
export async function parseExif(file: File): Promise<ExifData> {
  try {
    // exifrで全てのEXIFデータを取得
    const data = await exifr.parse(file, {
      gps: true,
      exif: true,
      ifd0: true,
      ifd1: true,
    });

    if (!data) {
      return { raw: {} };
    }

    // GPS情報の抽出
    let gps: GPS | undefined;
    if (data.latitude && data.longitude) {
      gps = {
        latitude: data.latitude,
        longitude: data.longitude,
      };
    }

    // 主要な情報を構造化
    const dateTimeValue = data.DateTimeOriginal || data.DateTime;
    const exifData: ExifData = {
      gps,
      make: data.Make,
      model: data.Model,
      dateTime: dateTimeValue instanceof Date 
        ? dateTimeValue.toLocaleString('ja-JP', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })
        : dateTimeValue,
      software: data.Software,
      orientation: data.Orientation,
      exposureTime: data.ExposureTime,
      fNumber: data.FNumber,
      iso: data.ISO,
      focalLength: data.FocalLength,
      raw: data,
    };

    return exifData;
  } catch (error) {
    console.error('EXIF解析エラー:', error);
    // エラーが発生してもアプリは継続（EXIFデータがない可能性）
    return { raw: {} };
  }
}

/**
 * EXIF情報からプライバシーリスクを分析
 * @param exifData - 解析済みのEXIFデータ
 * @returns RiskAnalysis - リスク分析結果
 */
export function analyzeRisk(exifData: ExifData): RiskAnalysis {
  const hasGPS = !!exifData.gps;
  const hasDeviceInfo = !!(exifData.make || exifData.model);
  const hasDateTime = !!exifData.dateTime;

  let level: RiskLevel;
  let message: string;

  if (hasGPS) {
    // GPS情報がある場合は最高リスク
    level = 'high';
    message = '⚠️ 危険: GPS位置情報が含まれています！あなたの居場所（自宅など）が特定される可能性があります。';
  } else if (hasDeviceInfo || hasDateTime) {
    // デバイス情報や撮影日時がある場合は中リスク
    level = 'medium';
    message = '注意: 撮影日時やデバイス情報が含まれています。個人を特定される可能性があります。';
  } else {
    // EXIF情報がほとんどない場合は低リスク
    level = 'low';
    message = '✓ 安全: 重要なメタデータは検出されませんでした。';
  }

  return {
    level,
    message,
    hasGPS,
    hasDeviceInfo,
    hasDateTime,
  };
}

/**
 * 画像からEXIF情報を完全に削除
 * @param file - EXIF削除対象の画像ファイル
 * @returns Promise<File> - EXIF削除済みの新しいFileオブジェクト
 */
export async function removeExif(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const dataUrl = e.target?.result as string;
        
        // すべての画像形式でCanvasを使って再描画（メタデータが削除される）
        cleanImageWithCanvas(dataUrl, file, resolve, reject);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('ファイル読み込みエラー'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Canvasを使用して画像を再描画し、メタデータを削除
 * @param dataUrl - 画像のData URL
 * @param originalFile - 元のファイルオブジェクト
 * @param resolve - Promiseのresolve関数
 * @param reject - Promiseのreject関数
 */
function cleanImageWithCanvas(
  dataUrl: string,
  originalFile: File,
  resolve: (file: File) => void,
  reject: (error: Error) => void
) {
  const img = new Image();
  
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context取得エラー'));
      return;
    }
    
    // 画像を再描画（メタデータは含まれない）
    ctx.drawImage(img, 0, 0);
    
    // BlobとFileに変換
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Blob変換エラー'));
        return;
      }
      
      const cleanedFile = new File([blob], originalFile.name, {
        type: originalFile.type,
      });
      resolve(cleanedFile);
    }, originalFile.type);
  };
  
  img.onerror = () => {
    reject(new Error('画像読み込みエラー'));
  };
  
  img.src = dataUrl;
}

/**
 * ExifDataを見やすい表示用の配列に変換
 * @param exifData - 表示するEXIFデータ
 * @returns Array<{key: string, value: string, isWarning: boolean}> - 表示用データ
 */
export function formatExifForDisplay(exifData: ExifData): Array<{
  key: string;
  value: string;
  isWarning: boolean;
}> {
  const items: Array<{ key: string; value: string; isWarning: boolean }> = [];

  if (exifData.gps) {
    items.push({
      key: 'GPS位置情報',
      value: `緯度: ${exifData.gps.latitude.toFixed(6)}, 経度: ${exifData.gps.longitude.toFixed(6)}`,
      isWarning: true,
    });
  }

  if (exifData.make) {
    items.push({
      key: 'カメラメーカー',
      value: String(exifData.make),
      isWarning: false,
    });
  }

  if (exifData.model) {
    items.push({
      key: 'カメラ機種',
      value: String(exifData.model),
      isWarning: false,
    });
  }

  if (exifData.dateTime) {
    const dateTimeStr = exifData.dateTime instanceof Date
      ? exifData.dateTime.toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      : String(exifData.dateTime);
    
    items.push({
      key: '撮影日時',
      value: dateTimeStr,
      isWarning: false,
    });
  }

  if (exifData.software) {
    items.push({
      key: '編集ソフトウェア',
      value: String(exifData.software),
      isWarning: false,
    });
  }

  if (exifData.iso) {
    items.push({
      key: 'ISO感度',
      value: String(exifData.iso),
      isWarning: false,
    });
  }

  if (exifData.fNumber) {
    items.push({
      key: 'F値',
      value: `f/${Number(exifData.fNumber)}`,
      isWarning: false,
    });
  }

  if (exifData.exposureTime) {
    items.push({
      key: '露出時間',
      value: `${Number(exifData.exposureTime)}秒`,
      isWarning: false,
    });
  }

  if (exifData.focalLength) {
    items.push({
      key: '焦点距離',
      value: `${Number(exifData.focalLength)}mm`,
      isWarning: false,
    });
  }

  // データが何もない場合
  if (items.length === 0) {
    items.push({
      key: 'EXIF情報',
      value: '検出されませんでした',
      isWarning: false,
    });
  }

  return items;
}

