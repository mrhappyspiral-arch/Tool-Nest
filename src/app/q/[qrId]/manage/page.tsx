import { Suspense } from 'react';
import ManageClient from '@/components/qr-tracker/ManageClient';

export const metadata = {
  title: 'QRコード管理 | QR Track - ToolNest',
  description: 'QRコードのスキャン数を確認し、リンク先URLを管理します。',
};

interface ManagePageProps {
  params: Promise<{ qrId: string }>;
}

export default async function ManagePage({ params }: ManagePageProps) {
  const { qrId } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ManageClient qrId={qrId} />
    </Suspense>
  );
}


