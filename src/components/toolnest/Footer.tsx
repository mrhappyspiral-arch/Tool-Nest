import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-slate-900 text-white p-1 rounded">
              <Zap size={16} fill="currentColor" />
            </div>
            <span className="font-bold text-lg text-slate-900">ToolNest</span>
          </div>
          <p className="text-slate-500 text-sm mb-4 max-w-xs">
            クリエイターやビジネスマンのための、便利なツールが集まるデジタル作業場。
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-4">カテゴリ</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-blue-600">画像・写真</a></li>
            <li><a href="#" className="hover:text-blue-600">PDFツール</a></li>
            <li><a href="#" className="hover:text-blue-600">AIアシスタント</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-4">リンク</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><a href="#" className="hover:text-blue-600">利用規約</a></li>
            <li><a href="#" className="hover:text-blue-600">プライバシーポリシー</a></li>
            <li><a href="#" className="hover:text-blue-600">運営者情報</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} ToolNest. All rights reserved.
      </div>
    </footer>
  );
}


