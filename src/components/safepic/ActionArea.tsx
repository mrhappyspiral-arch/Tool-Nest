'use client';

import { Download, Trash2, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ActionAreaProps {
  onRemoveExif: () => void;
  onDownload: () => void;
  onReset: () => void;
  isProcessing: boolean;
  isComplete: boolean;
}

export function ActionArea({
  onRemoveExif,
  onDownload,
  onReset,
  isProcessing,
  isComplete,
}: ActionAreaProps) {
  if (isComplete) {
    return (
      <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 w-full" style={{ writingMode: 'horizontal-tb' }}>
        <Alert className="bg-transparent border-0 p-0">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-600 dark:text-green-400" style={{ writingMode: 'horizontal-tb' }}>
            処理完了！画像が安全になりました
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300 mt-2" style={{ writingMode: 'horizontal-tb' }}>
            すべてのEXIF情報（位置情報、撮影データなど）が削除されました。
            この画像は安心して共有できます。
          </AlertDescription>
        </Alert>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onDownload}
            size="lg"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-5 w-5" />
            <span style={{ writingMode: 'horizontal-tb' }}>安全な画像をダウンロード</span>
          </Button>
          <Button onClick={onReset} variant="outline" size="lg">
            <RefreshCw className="mr-2 h-5 w-5" />
            <span style={{ writingMode: 'horizontal-tb' }}>別の画像を処理</span>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full" style={{ writingMode: 'horizontal-tb' }}>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2" style={{ writingMode: 'horizontal-tb' }}>次のステップ</h3>
          <p className="text-sm text-muted-foreground" style={{ writingMode: 'horizontal-tb' }}>
            画像からEXIF情報を完全に削除して、安全な状態にします。
          </p>
        </div>

        <Button
          onClick={onRemoveExif}
          disabled={isProcessing}
          size="lg"
          className="w-full"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              <span style={{ writingMode: 'horizontal-tb' }}>処理中...</span>
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-5 w-5" />
              <span style={{ writingMode: 'horizontal-tb' }}>EXIF情報を削除して安全にする</span>
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground" style={{ writingMode: 'horizontal-tb' }}>
          ※ すべての処理はブラウザ内で完結します。サーバーへのアップロードはありません。
        </p>
      </div>
    </Card>
  );
}

