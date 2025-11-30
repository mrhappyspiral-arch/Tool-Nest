# ToolNest

便利なWebツール集 - 画像処理、テキスト変換、データ分析など、様々な便利ツールを無料で提供します。

## 特徴

- 🔒 **プライバシー重視**: すべての処理はブラウザ内で完結し、データは外部に送信されません
- 🚀 **高速**: サーバーサイド処理不要で、即座に結果を取得
- 💰 **完全無料**: すべての機能を無料で使用可能
- 📱 **レスポンシブ**: PC、タブレット、スマートフォンに対応

## 搭載ツール

### SafePic（画像メタデータ削除ツール）
画像からGPS位置情報などのEXIFメタデータを検出・削除します。SNSへのアップロード前にプライバシーを保護できます。

**機能:**
- GPS位置情報の検出と警告
- カメラ情報、撮影日時などのメタデータ表示
- メタデータを完全に削除した画像のダウンロード
- ドラッグ&ドロップでの簡単アップロード

### その他のツール（今後追加予定）
- 画像圧縮
- Base64エンコーダー/デコーダー
- JSONフォーマッター
- その他多数のツールを計画中

## セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn

### インストール

\`\`\`bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### トラブルシューティング

**エラーが発生した場合:**

1. キャッシュをクリア:
\`\`\`bash
# .nextフォルダを削除
rm -rf .next

# または Windows PowerShellの場合
Remove-Item -Recurse -Force .next
\`\`\`

2. node_modulesを再インストール:
\`\`\`bash
# node_modulesを削除
rm -rf node_modules

# 依存関係を再インストール
npm install
\`\`\`

3. サーバーを再起動:
\`\`\`bash
# Ctrl+C でサーバーを停止
# その後、再起動
npm run dev
\`\`\`

## 開発

### プロジェクト構造

\`\`\`
src/
├── app/                    # Next.js App Router ページ
│   ├── page.tsx           # トップページ
│   ├── layout.tsx         # 共通レイアウト
│   ├── globals.css        # グローバルスタイル
│   └── tools/
│       └── safepic/       # SafePicツール
├── components/            # Reactコンポーネント
│   ├── toolnest/         # ToolNest共通コンポーネント
│   └── safepic/          # SafePic専用コンポーネント
├── lib/                  # ユーティリティ関数
│   ├── utils.ts          # 共通ユーティリティ
│   └── tools-data.ts     # ツール一覧データ
└── types/                # TypeScript型定義
    └── index.ts          # 共通型定義
\`\`\`

### 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **画像処理**: exifr (EXIF解析)

## ビルド

\`\`\`bash
# 本番用ビルド
npm run build

# 本番サーバー起動
npm start
\`\`\`

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します！バグ報告や機能リクエストは、Issueを作成してください。



