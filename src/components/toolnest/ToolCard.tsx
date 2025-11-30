import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/tools-data";

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const isNew = tool.badge === "NEW";
  const isComingSoon = tool.status === "coming-soon";

  return (
    <Link href={tool.href} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isNew && (
            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>
          )}
          {isComingSoon && (
            <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded">近日公開</span>
          )}
        </div>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors text-2xl">
            {tool.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
              {tool.name}
            </h3>
            <span className="text-xs text-slate-400 font-medium uppercase">{tool.category}</span>
          </div>
        </div>
        
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          {tool.description}
        </p>

        <div className="flex items-center text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
          {isComingSoon ? "近日公開予定" : "使ってみる"} <ArrowRight size={16} className="ml-1" />
        </div>
      </div>
    </Link>
  );
}
