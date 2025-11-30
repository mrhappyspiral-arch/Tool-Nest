"use client";

import { useState } from "react";
import { Search, Zap } from "lucide-react";
import Footer from "@/components/toolnest/Footer";
import ToolCard from "@/components/toolnest/ToolCard";
import CategoryFilter from "@/components/toolnest/CategoryFilter";
import { TOOLS_DATA, CATEGORIES } from "@/lib/tools-data";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // フィルタリングされたツール一覧
  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* ToolNest Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 text-white p-1.5 rounded-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">ToolNest</span>
          </div>
          
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

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-100 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-emerald-100">
              NEW: QR Track リリース 📱
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              毎日の作業を、<span className="text-[#4EA8FF]">もっと軽く。</span>
            </h1>
            <p className="text-slate-500 text-lg mb-8 max-w-2xl mx-auto">
              画像・PDF・テキスト・AI。必要なツールが全部そろう、便利なデジタル作業デスク。
            </p>
            
            {/* Search Box */}
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="ツールを検索（例：EXIF, PDF, 変換...）" 
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all group-hover:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          {/* Category Tabs */}
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Tool Grid */}
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <p>条件に一致するツールが見つかりませんでした。</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}


