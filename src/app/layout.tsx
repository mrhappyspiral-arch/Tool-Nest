import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToolNest - 便利なWebツール集",
  description: "画像処理、テキスト変換、データ分析など、様々な便利ツールを提供します",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}


