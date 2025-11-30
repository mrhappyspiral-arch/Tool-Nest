'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Dropzone } from '@/components/safepic/Dropzone';
import { ExifViewer } from '@/components/safepic/ExifViewer';
import { SafetyMap } from '@/components/safepic/SafetyMap';
import { ActionArea } from '@/components/safepic/ActionArea';
import { Button } from '@/components/ui/button';
import type { ExifData, RiskAnalysis, ProcessingStatus } from '@/types';
import { parseExif, analyzeRisk, removeExif } from '@/lib/exif-utils';

interface SafePicClientProps {
  showHeader?: boolean; // デフォルト true
}

export default function SafePicClient({ showHeader = true }: SafePicClientProps) {
  // 状態管理
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [cleanedFile, setCleanedFile] = useState<File | null>(null);
  const [exifData, setExifData] = useState<ExifData | null>(null);
  const [cleanedExifData, setCleanedExifData] = useState<ExifData | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>({
    isAnalyzing: false,
    isRemoving: false,
    isComplete: false,
  });

  // ファイル選択時の処理
  const handleFileSelect = async (file: File) => {
    setStatus({ isAnalyzing: true, isRemoving: false, isComplete: false });
    setOriginalFile(file);
    setCleanedFile(null);
    setCleanedExifData(null);

    try {
      // EXIF情報を解析
      const data = await parseExif(file);
      setExifData(data);

      // リスク分析
      const risk = analyzeRisk(data);
      setRiskAnalysis(risk);

      setStatus({ isAnalyzing: false, isRemoving: false, isComplete: false });
    } catch (error) {
      console.error('解析エラー:', error);
      setStatus({
        isAnalyzing: false,
        isRemoving: false,
        isComplete: false,
        error: '画像の解析に失敗しました',
      });
    }
  };

  // EXIF削除処理
  const handleRemoveExif = async () => {
    if (!originalFile) return;

    setStatus({ isAnalyzing: false, isRemoving: true, isComplete: false });

    try {
      // EXIF情報を削除
      const cleaned = await removeExif(originalFile);
      setCleanedFile(cleaned);

      // 削除後のEXIF情報を確認（空であることを確認）
      const cleanedData = await parseExif(cleaned);
      setCleanedExifData(cleanedData);

      setStatus({ isAnalyzing: false, isRemoving: false, isComplete: true });
    } catch (error) {
      console.error('削除エラー:', error);
      setStatus({
        isAnalyzing: false,
        isRemoving: false,
        isComplete: false,
        error: 'EXIF情報の削除に失敗しました',
      });
    }
  };

  // ダウンロード処理
  const handleDownload = () => {
    if (!cleanedFile) return;

    const url = URL.createObjectURL(cleanedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safe_${originalFile?.name || 'image.jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // リセット処理
  const handleReset = () => {
    setOriginalFile(null);
    setCleanedFile(null);
    setExifData(null);
    setCleanedExifData(null);
    setRiskAnalysis(null);
    setStatus({ isAnalyzing: false, isRemoving: false, isComplete: false });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* ホームに戻るボタン */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>ホームに戻る</span>
            </Button>
          </Link>
        </div>

        {/* ヘッダーセクション - オプションで表示 */}
        {showHeader && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              SafePic - 画像プライバシー保護ツール
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              画像に含まれる位置情報や撮影データを解析・可視化し、安全に削除します
            </p>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="space-y-6">
          {/* 初期状態: ファイルアップロード */}
          {!originalFile && (
            <Dropzone
              onFileSelect={handleFileSelect}
              disabled={status.isAnalyzing}
            />
          )}

          {/* 解析中 */}
          {status.isAnalyzing && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">画像を解析しています...</p>
            </div>
          )}

          {/* 解析完了: EXIF情報表示 */}
          {exifData && riskAnalysis && !status.isAnalyzing && !status.isComplete && (
            <>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 min-w-0 w-full">
                <div className="min-w-0 w-full">
                  <ExifViewer
                    exifData={exifData}
                    riskAnalysis={riskAnalysis}
                    title="検出されたEXIF情報"
                  />
                </div>

                {/* GPS情報がある場合のみ地図を表示 */}
                {exifData.gps && (
                  <div className="min-w-0 w-full">
                    <SafetyMap gps={exifData.gps} />
                  </div>
                )}
              </div>

              <ActionArea
                onRemoveExif={handleRemoveExif}
                onDownload={handleDownload}
                onReset={handleReset}
                isProcessing={status.isRemoving}
                isComplete={status.isComplete}
              />
            </>
          )}

          {/* 処理完了: Before/After比較 */}
          {status.isComplete && cleanedExifData && exifData && riskAnalysis && (
            <>
              <ActionArea
                onRemoveExif={handleRemoveExif}
                onDownload={handleDownload}
                onReset={handleReset}
                isProcessing={status.isRemoving}
                isComplete={status.isComplete}
              />

              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 min-w-0 w-full">
                <div className="min-w-0 w-full">
                  <ExifViewer
                    exifData={exifData}
                    riskAnalysis={riskAnalysis}
                    title="削除前のEXIF情報"
                  />
                </div>

                <div className="min-w-0 w-full">
                  <ExifViewer
                    exifData={cleanedExifData}
                    riskAnalysis={analyzeRisk(cleanedExifData)}
                    title="削除後のEXIF情報"
                  />
                </div>
              </div>
            </>
          )}

          {/* エラー表示 */}
          {status.error && (
            <div className="text-center py-8">
              <p className="text-destructive">{status.error}</p>
              <button
                onClick={handleReset}
                className="mt-4 text-sm text-primary hover:underline"
              >
                最初からやり直す
              </button>
            </div>
          )}
        </div>

        {/* 説明セクション */}
        <div className="mt-12 pt-8 border-t w-full">
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3 text-center max-w-5xl mx-auto">
            <div className="space-y-3 px-4">
              <div className="text-4xl" style={{ writingMode: 'horizontal-tb' }}>🔒</div>
              <h3 className="font-semibold text-lg" style={{ writingMode: 'horizontal-tb' }}>完全ローカル処理</h3>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ writingMode: 'horizontal-tb' }}>
                すべての処理はブラウザ内で完結。サーバーに画像をアップロードしません。
              </p>
            </div>
            <div className="space-y-3 px-4">
              <div className="text-4xl" style={{ writingMode: 'horizontal-tb' }}>🗺️</div>
              <h3 className="font-semibold text-lg" style={{ writingMode: 'horizontal-tb' }}>危険性の可視化</h3>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ writingMode: 'horizontal-tb' }}>
                GPS情報を地図上に表示し、プライバシーリスクを視覚的に理解できます。
              </p>
            </div>
            <div className="space-y-3 px-4">
              <div className="text-4xl" style={{ writingMode: 'horizontal-tb' }}>✨</div>
              <h3 className="font-semibold text-lg" style={{ writingMode: 'horizontal-tb' }}>Before/After比較</h3>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ writingMode: 'horizontal-tb' }}>
                削除前後のメタデータを比較表示し、安全性を確認できます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
