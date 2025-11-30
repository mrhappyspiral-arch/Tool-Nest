'use client';

import { useState } from 'react';
import { Link2, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UrlUpdateFormProps {
  qrId: string;
  token: string;
  currentUrl: string;
  onUpdate: (newUrl: string) => void;
}

export function UrlUpdateForm({ qrId, token, currentUrl, onUpdate }: UrlUpdateFormProps) {
  const [newUrl, setNewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    // URL形式チェック
    try {
      new URL(newUrl);
    } catch {
      setError('有効なURLを入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/qr/${qrId}/target`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newTargetUrl: newUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'URL更新に失敗しました');
      }

      setSuccess(true);
      setNewUrl('');
      onUpdate(newUrl);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">リンク先URLを変更</h3>
      
      {/* 現在のURL */}
      <div className="mb-4">
        <label className="text-xs text-slate-500 mb-1 block">現在のURL</label>
        <div className="bg-slate-50 px-3 py-2 rounded-lg text-sm text-slate-600 break-all border border-slate-100">
          {currentUrl}
        </div>
      </div>

      {/* 新しいURL入力 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="new-url" className="text-xs text-slate-500 mb-1 block">
            新しいURL
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="new-url"
              type="text"
              value={newUrl}
              onChange={(e) => {
                setNewUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://example.com/new-page"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-xs">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-emerald-600 text-xs">
            <Check className="h-4 w-4" />
            URLを更新しました
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !newUrl}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              更新中...
            </>
          ) : (
            'URLを更新する'
          )}
        </Button>
      </form>

      <p className="mt-3 text-xs text-slate-500">
        ※ 変更後も同じQRコードで新しいURLに遷移します。印刷済みのQRを刷り直す必要はありません。
      </p>
    </div>
  );
}


