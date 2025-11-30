import SafePicClient from "@/components/safepic/SafePicClient";

export const metadata = {
  title: "SafePic - 画像メタデータ削除ツール | ToolNest",
  description: "画像からGPS位置情報などのメタデータを検出・削除します。プライバシー保護に最適なツールです。",
};

export default function SafePicPage() {
  return <SafePicClient />;
}



