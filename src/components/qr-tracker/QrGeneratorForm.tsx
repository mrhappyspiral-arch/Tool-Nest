'use client';

import { useRef, useState } from 'react';
import { Link2, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrGeneratorFormProps {
  onSubmit: (name: string, targetUrl: string) => Promise<void>;
  isLoading: boolean;
}

export function QrGeneratorForm({ onSubmit, isLoading }: QrGeneratorFormProps) {
  const [urlError, setUrlError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setUrlError('URLを入力してください');
      return false;
    }
    try {
      new URL(url);
      setUrlError('');
      return true;
    } catch {
      setUrlError('有効なURLを入力してください（例：https://example.com）');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = nameRef.current?.value || '';
    const targetUrl = urlRef.current?.value || '';
    
    if (!validateUrl(targetUrl)) return;
    await onSubmit(name, targetUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* QR名入力 */}
      <div className="space-y-2">
        <label 
          htmlFor="qr-name" 
          className="block text-sm font-medium text-slate-700"
        >
          QRの名前 <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <div className="relative">
          <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            ref={nameRef}
            id="qr-name"
            type="text"
            placeholder="例：店舗POP用QR、イベントチラシ"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-slate-500">
          管理画面で識別しやすい名前を付けることができます
        </p>
      </div>

      {/* リンク先URL入力 */}
      <div className="space-y-2">
        <label 
          htmlFor="target-url" 
          className="block text-sm font-medium text-slate-700"
        >
          リンク先URL <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            ref={urlRef}
            id="target-url"
            type="text"
            placeholder="https://example.com/campaign"
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
              urlError ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
            } focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
            disabled={isLoading}
            required
          />
        </div>
        {urlError && (
          <p className="text-xs text-red-500">{urlError}</p>
        )}
        <p className="text-xs text-slate-500">
          QRコードをスキャンした時に開くURLを入力してください
        </p>
      </div>

      {/* 送信ボタン */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            作成中...
          </>
        ) : (
          <>
            <QrCode className="mr-2 h-5 w-5" />
            QRコードを作成
          </>
        )}
      </Button>
    </form>
  );
}
