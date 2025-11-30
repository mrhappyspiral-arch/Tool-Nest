## ToolNest 開発・引継ぎメモ

便利な Web ツール集 **ToolNest** のコードベースです。

- **SafePic**: 画像メタデータ（EXIF）削除ツール  
  - パス: `/tools/safepic`
- **QR Track**: QR コード生成＋トラッキングツール  
  - パス: `/tools/qr-tracker`

この文書は、別フォルダ／別 PC にプロジェクトをコピーしても、Cursor 上でスムーズに開発を再開できるようにするための **引継ぎメモ** です。

---

## 1. プロジェクト概要

- **フレームワーク**: Next.js 15（App Router）
- **言語**: TypeScript
- **UI**: Tailwind CSS + Lucide Icons
- **DB**: Prisma（現在は sqlite / 将来 Postgres へ移行予定）

### 主なツール

- **SafePic**: 画像 EXIF 解析＆削除  
  - ルート: `/tools/safepic`
- **QR Track**: QR 生成＋トラッキング  
  - ルート: `/tools/qr-tracker`

---

## 2. フォルダ構成（概要）

- **`src/`**
  - **`app/`**
    - `page.tsx`                 … ToolNest トップ
    - `layout.tsx`               … 共通レイアウト
    - `globals.css`
    - **`tools/`**
      - `safepic/`               … SafePic ページ
      - `qr-tracker/`            … QR Track ページ
    - **`q/`**
      - `[qrId]/`
        - `route.ts`             … 配布用 URL（ログ記録 + 302 リダイレクト）
        - `manage/page.tsx`      … 管理画面
    - **`api/`**
      - `qr/`
        - `route.ts`             … `POST /api/qr`          （QR 作成）
        - `[qrId]/`
          - `stats/route.ts`     … `GET   /api/qr/{id}/stats`   （統計取得）
          - `target/route.ts`    … `PATCH /api/qr/{id}/target`  （ターゲット URL 更新）
  - **`components/`**
    - `toolnest/`                … 共通 UI（ヘッダー/フッターなど）
    - `safepic/`                 … SafePic 用コンポーネント
    - `qr-tracker/`              … QR Track 用コンポーネント
    - `ui/`                      … Button / Card などの共通 UI
  - **`lib/`**
    - `db.ts`                    … 簡易 DB（ファイルベース実装 or Prisma に差し替え用）
    - `exif-utils.ts`            … SafePic 用ユーティリティ
    - `qr-utils.ts`              … QR 関連ユーティリティ
    - `tools-data.ts`            … トップページのツール一覧
  - **`types/`**
    - `index.ts`
    - `qr-tracker.ts`            … QR Track 用型定義

- **`prisma/`**
  - `schema.prisma`              … Prisma スキーマ（現状 `provider = "sqlite"`）

---

## 3. ローカル開発手順（新しいフォルダ側）

### 3-1. 依存関係インストール

```bash
npm install
```

### 3-2. 環境変数（`.env`）作成

プロジェクトルートに `.env` を作成：

```env
# 開発時 DB（現状は sqlite のままでも動作想定）
DATABASE_URL="file:./prisma/dev.db"

# 開発中に QR に埋め込むベース URL
NEXT_PUBLIC_BASE_URL="http://localhost:3001"
```

### 3-3. Prisma（使う場合）

```bash
npx prisma db push
npx prisma generate
```

- `prisma/schema.prisma` の `datasource db` は現状 `provider = "sqlite"` のまま  
- Postgres に変える場合は、この `provider` と `DATABASE_URL` を差し替える

### 3-4. 開発サーバー起動

```bash
npm run dev -- -p 3001
```

- **トップ**: `http://localhost:3001/`
- **SafePic**: `http://localhost:3001/tools/safepic`
- **QR Track**: `http://localhost:3001/tools/qr-tracker`

---

## 4. QR Track の仕組み

### 4-1. ベース URL 決定ロジック（`src/lib/qr-utils.ts`）

```ts
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3001';
}
```

- **開発**: `NEXT_PUBLIC_BASE_URL` または `http://localhost:3001`
- **Vercel 本番**: `https://<project>.vercel.app`（`VERCEL_URL`）
- 新しく生成した QR には、常にこの **ベース URL** が埋め込まれる。

### 4-2. 主なフロー

- **フロント**: `/tools/qr-tracker` で `name` / `targetUrl` を入力
- `POST /api/qr` が呼ばれ、`qr_codes` にレコード作成
- レスポンスで以下を返す:
  - `publicUrl`: `.../q/{qrId}`
  - `manageUrl`: `.../q/{qrId}/manage?token=...`

---

### 4-3. 配布用 URL `/q/{qrId}` にアクセスしたとき

- `qr_scan_logs` にログを 1 件追加
- `targetUrl` へ **302 リダイレクト**

---

### 4-4. 管理画面 `/q/{qrId}/manage?token=...`

- `GET  /api/qr/{qrId}/stats?token=...` で統計取得
- `PATCH /api/qr/{qrId}/target` で `targetUrl` を更新

---

## 5. Vercel + Postgres 移行メモ（任意）

1. Postgres（Neon / Supabase 等）で DB を作成し、接続文字列を取得。
2. `prisma/schema.prisma` を修正：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. `.env` と Vercel の Environment Variables に同じ `DATABASE_URL` を設定。
4. ローカルで以下を実行：

```bash
npx prisma db push
npx prisma generate
```

5. GitHub に push → Vercel が自動デプロイ。

以後、生成される QR には `https://<project>.vercel.app/q/{qrId}` が埋め込まれるため、スマホからのアクセスもそのまま可能。

---

## 6. Cursor 上で開発を再開する時のポイント

- 新しいフォルダでこのリポジトリを開いたら、まず `README.md` とこの `DEV_HANDOVER.md` をざっと読む。
- `src/lib/qr-utils.ts` と `src/app/api/qr/*` / `src/app/q/[qrId]` が **QR Track の中核**。
- 仕様書としては、ユーザーが最初に提示した「QR コード生成＋トラッキングツール 実装指示書」に完全準拠しているので、**追加仕様はそこに追記**していくと分かりやすい。

---

## 7. 今後追記すると良さそうな項目（メモ）

- 今後やりたい TODO（機能追加・バグ修正・リファクタリング候補など）
- デプロイ先 URL（Vercel 本番・プレビュー・ステージングなど）
- Prisma スキーマ変更時のメモ（マイグレーション方針など）
- QR Track / SafePic の仕様変更履歴

この内容を元に、別フォルダへコピーしたリポジトリでもそのまま開発・運用が続けられるはずです。  
必要に応じて、この文書をアップデートしながらドキュメントとして育ててください。



