/**
 * ToolNest - ツールデータ定義
 */

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  href: string;
  status: 'available' | 'coming-soon';
  badge?: string;
}

export const CATEGORIES = [
  { id: 'all', name: 'すべて', icon: '🎯' },
  { id: 'image', name: '画像', icon: '🖼️' },
  { id: 'text', name: 'テキスト', icon: '📝' },
  { id: 'file', name: 'ファイル', icon: '📁' },
  { id: 'data', name: 'データ', icon: '📊' },
  { id: 'dev', name: '開発', icon: '⚡' },
] as const;

export const TOOLS_DATA: Tool[] = [
  // 画像カテゴリ
  {
    id: 'safepic',
    name: 'SafePic',
    description: '画像からGPS位置情報などのEXIFメタデータを検出・削除します。',
    icon: '🔒',
    category: 'image',
    tags: ['EXIF', 'プライバシー', 'GPS', 'メタデータ', '画像'],
    href: '/tools/safepic',
    status: 'available',
    badge: 'NEW',
  },
  {
    id: 'image-compress',
    name: '画像圧縮',
    description: '画質を保ちながら画像ファイルサイズを削減します。',
    icon: '🗜️',
    category: 'image',
    tags: ['圧縮', '最適化', 'JPEG', 'PNG'],
    href: '/tools/image-compress',
    status: 'coming-soon',
  },
  {
    id: 'image-resize',
    name: '画像リサイズ',
    description: '画像のサイズを簡単に変更できます。',
    icon: '📐',
    category: 'image',
    tags: ['リサイズ', 'サイズ変更', '画像'],
    href: '/tools/image-resize',
    status: 'coming-soon',
  },
  {
    id: 'image-format-converter',
    name: '画像形式変換',
    description: 'JPEG、PNG、WebP、GIF間で画像形式を変換します。',
    icon: '🔄',
    category: 'image',
    tags: ['変換', 'JPEG', 'PNG', 'WebP', 'GIF'],
    href: '/tools/image-format-converter',
    status: 'coming-soon',
  },

  // テキストカテゴリ
  {
    id: 'base64',
    name: 'Base64エンコーダー/デコーダー',
    description: 'テキストや画像をBase64形式にエンコード・デコードします。',
    icon: '🔐',
    category: 'text',
    tags: ['Base64', 'エンコード', 'デコード'],
    href: '/tools/base64',
    status: 'coming-soon',
  },
  {
    id: 'json-formatter',
    name: 'JSONフォーマッター',
    description: 'JSONデータを整形・検証します。',
    icon: '{ }',
    category: 'text',
    tags: ['JSON', 'フォーマット', '整形', '検証'],
    href: '/tools/json-formatter',
    status: 'coming-soon',
  },
  {
    id: 'markdown-preview',
    name: 'Markdownプレビュー',
    description: 'Markdownをリアルタイムでプレビューします。',
    icon: '📄',
    category: 'text',
    tags: ['Markdown', 'プレビュー', 'エディタ'],
    href: '/tools/markdown-preview',
    status: 'coming-soon',
  },
  {
    id: 'text-diff',
    name: 'テキスト差分比較',
    description: '2つのテキストの差分を視覚的に表示します。',
    icon: '🔍',
    category: 'text',
    tags: ['差分', '比較', 'diff'],
    href: '/tools/text-diff',
    status: 'coming-soon',
  },

  // ファイルカテゴリ
  {
    id: 'pdf-merger',
    name: 'PDF結合',
    description: '複数のPDFファイルを1つに結合します。',
    icon: '📑',
    category: 'file',
    tags: ['PDF', '結合', 'マージ'],
    href: '/tools/pdf-merger',
    status: 'coming-soon',
  },
  {
    id: 'pdf-splitter',
    name: 'PDF分割',
    description: 'PDFファイルをページごとに分割します。',
    icon: '✂️',
    category: 'file',
    tags: ['PDF', '分割', 'スプリット'],
    href: '/tools/pdf-splitter',
    status: 'coming-soon',
  },
  {
    id: 'file-hash',
    name: 'ファイルハッシュ計算',
    description: 'MD5、SHA-1、SHA-256などのハッシュ値を計算します。',
    icon: '#️⃣',
    category: 'file',
    tags: ['ハッシュ', 'MD5', 'SHA', 'チェックサム'],
    href: '/tools/file-hash',
    status: 'coming-soon',
  },

  // データカテゴリ
  {
    id: 'csv-viewer',
    name: 'CSVビューアー',
    description: 'CSVファイルを表形式で表示・編集します。',
    icon: '📊',
    category: 'data',
    tags: ['CSV', 'テーブル', 'データ'],
    href: '/tools/csv-viewer',
    status: 'coming-soon',
  },
  {
    id: 'qr-tracker',
    name: 'QR Track',
    description: 'QRコードを生成してスキャン数をトラッキング。会員登録不要。',
    icon: '📱',
    category: 'data',
    tags: ['QRコード', '生成', 'トラッキング', '分析', 'アクセス解析'],
    href: '/tools/qr-tracker',
    status: 'available',
    badge: 'NEW',
  },
  {
    id: 'qr-generator',
    name: 'QRコード生成',
    description: 'テキストやURLからQRコードを生成します。',
    icon: '▣',
    category: 'data',
    tags: ['QRコード', '生成', 'バーコード'],
    href: '/tools/qr-generator',
    status: 'coming-soon',
  },
  {
    id: 'color-picker',
    name: 'カラーピッカー',
    description: 'HEX、RGB、HSLなど様々な形式で色を選択・変換します。',
    icon: '🎨',
    category: 'data',
    tags: ['色', 'カラー', 'HEX', 'RGB'],
    href: '/tools/color-picker',
    status: 'coming-soon',
  },

  // 開発カテゴリ
  {
    id: 'regex-tester',
    name: '正規表現テスター',
    description: '正規表現のパターンをテスト・デバッグします。',
    icon: '⚡',
    category: 'dev',
    tags: ['正規表現', 'regex', 'テスト'],
    href: '/tools/regex-tester',
    status: 'coming-soon',
  },
  {
    id: 'jwt-decoder',
    name: 'JWTデコーダー',
    description: 'JSON Web Token (JWT) をデコード・検証します。',
    icon: '🔑',
    category: 'dev',
    tags: ['JWT', 'トークン', 'デコード'],
    href: '/tools/jwt-decoder',
    status: 'coming-soon',
  },
  {
    id: 'url-parser',
    name: 'URLパーサー',
    description: 'URLを構成要素に分解して表示します。',
    icon: '🔗',
    category: 'dev',
    tags: ['URL', 'パース', 'クエリパラメータ'],
    href: '/tools/url-parser',
    status: 'coming-soon',
  },
];
