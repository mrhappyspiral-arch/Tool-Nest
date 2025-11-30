'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, QrCode, Copy, Check, Download, 
  BarChart3, Calendar, TrendingUp, RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsChart } from './StatsChart';
import { UrlUpdateForm } from './UrlUpdateForm';
import type { QrStatsResponse } from '@/types/qr-tracker';

interface ManageClientProps {
  qrId: string;
}

// QRコード生成用のURL（外部API）
function getQrImageUrl(data: string, size: number = 140): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png&margin=10`;
}

export default function ManageClient({ qrId }: ManageClientProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [stats, setStats] = useState<QrStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchStats = async () => {
    if (!token) {
      setError('アクセストークンが指定されていません');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/qr/${qrId}/stats?token=${encodeURIComponent(token)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('QRコードが見つからないか、アクセス権がありません');
        } else {
          setError('統計情報の取得に失敗しました');
        }
        return;
      }

      const data: QrStatsResponse = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('通信エラーが発生しました');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrId, token]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDownload = async () => {
    if (!stats) return;
    
    try {
      // 高解像度のQR画像をダウンロード
      const highResUrl = getQrImageUrl(stats.publicUrl, 512);
      const response = await fetch(highResUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `qr-${stats.name || 'code'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleUrlUpdate = (newUrl: string) => {
    if (stats) {
      setStats({ ...stats, targetUrl: newUrl });
    }
  };

  // エラー表示
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">アクセスできません</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link href="/tools/qr-tracker">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <QrCode className="h-4 w-4 mr-2" />
              新しいQRを作成する
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-slate-600">統計情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const qrImageUrl = getQrImageUrl(stats.publicUrl, 140);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* ナビゲーション */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/tools/qr-tracker">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 backdrop-blur">
              <ArrowLeft className="h-4 w-4" />
              <span>QR作成に戻る</span>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchStats}
            className="flex items-center gap-2 bg-white/80 backdrop-blur"
          >
            <RefreshCw className="h-4 w-4" />
            <span>更新</span>
          </Button>
        </div>

        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* QRコード */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <img
                  src={qrImageUrl}
                  alt="QR Code"
                  width={140}
                  height={140}
                  className="block"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="mt-2 text-xs text-slate-500 hover:text-slate-700"
              >
                <Download className="h-3 w-3 mr-1" />
                ダウンロード
              </Button>
            </div>

            {/* 情報 */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {stats.name}
              </h1>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-slate-500">配布用URL</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-slate-700 truncate">
                      {stats.publicUrl}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(stats.publicUrl)}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500">現在のリンク先</label>
                  <p className="text-sm text-slate-600 truncate">{stats.targetUrl}</p>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500">作成日</label>
                  <p className="text-sm text-slate-600">
                    {new Date(stats.createdAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg mb-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.today}</p>
            <p className="text-xs text-slate-500">今日のスキャン</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.last7days}</p>
            <p className="text-xs text-slate-500">過去7日間</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-cyan-100 rounded-lg mb-2">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500">累計スキャン</p>
          </div>
        </div>

        {/* グラフとURL更新 */}
        <div className="grid md:grid-cols-2 gap-6">
          <StatsChart daily={stats.daily} />
          <UrlUpdateForm
            qrId={qrId}
            token={token || ''}
            currentUrl={stats.targetUrl}
            onUpdate={handleUrlUpdate}
          />
        </div>

        {/* 注意書き */}
        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">管理URLについて</p>
              <p className="text-xs leading-relaxed">
                この管理画面のURLはブックマークして安全に保管してください。
                URLを知っている人は誰でもこの画面にアクセスできます。
                URLを紛失した場合、この統計は二度と確認できなくなります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
