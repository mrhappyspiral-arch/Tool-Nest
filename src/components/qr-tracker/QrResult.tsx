'use client';

import { useState, useRef } from 'react';
import { Copy, Check, ExternalLink, Shield, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QrCreateResponse } from '@/types/qr-tracker';

interface QrResultProps {
  result: QrCreateResponse;
  onReset: () => void;
}

// QRコード生成用のURL（外部API）
function getQrImageUrl(data: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png&margin=10`;
}

export function QrResult({ result, onReset }: QrResultProps) {
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedManage, setCopiedManage] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const copyToClipboard = async (text: string, type: 'public' | 'manage') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'public') {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
      } else {
        setCopiedManage(true);
        setTimeout(() => setCopiedManage(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = async () => {
    try {
      // 高解像度のQR画像をダウンロード
      const highResUrl = getQrImageUrl(result.publicUrl, 512);
      const response = await fetch(highResUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `qr-${result.displayName || 'code'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const qrImageUrl = getQrImageUrl(result.publicUrl, 200);

  return (
    <div className="space-y-8">
      {/* 成功メッセージ */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200">
          <Check className="h-4 w-4" />
          QRコードが作成されました！
        </div>
      </div>

      {/* QRコード表示 */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <img
            ref={imgRef}
            src={qrImageUrl}
            alt="QR Code"
            width={200}
            height={200}
            className="block"
          />
        </div>
        <p className="text-sm text-slate-600 font-medium">{result.displayName}</p>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          PNG画像をダウンロード
        </Button>
      </div>

      {/* URL表示エリア */}
      <div className="space-y-4">
        {/* 配布用URL */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-emerald-500" />
              配布用URL
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(result.publicUrl, 'public')}
              className="text-slate-500 hover:text-slate-700"
            >
              {copiedPublic ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">{copiedPublic ? 'コピー済み' : 'コピー'}</span>
            </Button>
          </div>
          <code className="block text-sm bg-white px-3 py-2 rounded-lg border border-slate-200 text-slate-800 break-all">
            {result.publicUrl}
          </code>
          <p className="mt-2 text-xs text-slate-500">
            この URL が QR コードに埋め込まれています。配布物に印刷してください。
          </p>
        </div>

        {/* 管理用URL */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-600" />
              管理用URL（重要）
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(result.manageUrl, 'manage')}
              className="text-amber-600 hover:text-amber-800"
            >
              {copiedManage ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">{copiedManage ? 'コピー済み' : 'コピー'}</span>
            </Button>
          </div>
          <code className="block text-sm bg-white px-3 py-2 rounded-lg border border-amber-200 text-slate-800 break-all">
            {result.manageUrl}
          </code>
          <div className="mt-3 flex items-start gap-2 p-3 bg-amber-100 rounded-lg">
            <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>この URL はブックマークするか、安全な場所に保存してください。</strong>
              <br />
              この URL を知っている人は誰でもスキャン数の確認とリンク先の変更ができます。紛失すると統計が確認できなくなります。
            </p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 py-5"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          新しいQRを作成
        </Button>
        <Button
          onClick={() => window.open(result.manageUrl, '_blank')}
          className="flex-1 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          管理画面を開く
        </Button>
      </div>
    </div>
  );
}
