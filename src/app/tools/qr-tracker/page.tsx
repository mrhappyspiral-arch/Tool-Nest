import QrTrackerClient from '@/components/qr-tracker/QrTrackerClient';

export const metadata = {
  title: 'QR Track - QRコード生成＋トラッキングツール | ToolNest',
  description: 'QRコードを生成してスキャン数をトラッキング。会員登録不要、URLを保存するだけで統計が見られます。',
};

export default function QrTrackerPage() {
  return <QrTrackerClient />;
}


