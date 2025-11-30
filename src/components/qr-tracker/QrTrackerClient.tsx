'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, QrCode, BarChart3, Link2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QrGeneratorForm } from './QrGeneratorForm';
import { QrResult } from './QrResult';
import type { QrCreateResponse } from '@/types/qr-tracker';

export default function QrTrackerClient() {
  const [result, setResult] = useState<QrCreateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (name: string, targetUrl: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, targetUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'QRコードの作成に失敗しました');
      }

      const data: QrCreateResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* ホームに戻るボタン */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 backdrop-blur">
              <ArrowLeft className="h-4 w-4" />
              <span>ホームに戻る</span>
            </Button>
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/25 mb-4">
            <QrCode className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900">
            QR Track
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto">
            QRコードを生成して、スキャン数をトラッキング。
            <br className="hidden sm:inline" />
            会員登録不要、URLを保存するだけで統計が見られます。
          </p>
        </div>

        {/* 機能アイコン */}
        {!result && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center border border-slate-100">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg mb-2">
                <QrCode className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-xs font-medium text-slate-700">QR生成</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center border border-slate-100">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
                <BarChart3 className="h-5 w-5 text-teal-600" />
              </div>
              <p className="text-xs font-medium text-slate-700">スキャン数追跡</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 text-center border border-slate-100">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-cyan-100 rounded-lg mb-2">
                <Link2 className="h-5 w-5 text-cyan-600" />
              </div>
              <p className="text-xs font-medium text-slate-700">URL変更可能</p>
            </div>
          </div>
        )}

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {!result ? (
            <QrGeneratorForm onSubmit={handleSubmit} isLoading={isLoading} />
          ) : (
            <QrResult result={result} onReset={handleReset} />
          )}
        </div>

        {/* 説明セクション */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">使い方</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                <h3 className="font-semibold text-slate-900">QRを作成</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                リンク先URLを入力してQRコードを作成。印刷して配布物に使用できます。
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm">2</div>
                <h3 className="font-semibold text-slate-900">管理URLを保存</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                発行された管理URLをブックマーク。これがスキャン数を見るための鍵になります。
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-sm">3</div>
                <h3 className="font-semibold text-slate-900">統計を確認</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                管理URLを開くだけで、今日・7日間・累計のスキャン数を確認できます。
              </p>
            </div>
          </div>
        </div>

        {/* 特徴 */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-100">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-slate-700">会員登録不要</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-100">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-slate-700">無料で使える</span>
          </div>
          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-100">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-slate-700">リンク先の変更可能</span>
          </div>
        </div>
      </div>
    </div>
  );
}


