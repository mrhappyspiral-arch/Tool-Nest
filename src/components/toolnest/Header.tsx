import Link from "next/link";
import { Zap } from "lucide-react";

export default function Header() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-blue-500 text-white p-1.5 rounded-lg">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">ToolNest</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-blue-500">カテゴリ</a>
          <a href="#" className="hover:text-blue-500">新着</a>
          <a href="#" className="hover:text-blue-500">ランキング</a>
          <a href="#" className="hover:text-blue-500">About</a>
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:flex bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
            開発者登録
          </button>
        </div>
      </div>
    </nav>
  );
}


