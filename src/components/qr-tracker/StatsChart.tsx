'use client';

import type { DailyCount } from '@/types/qr-tracker';

interface StatsChartProps {
  daily: DailyCount[];
}

export function StatsChart({ daily }: StatsChartProps) {
  const maxCount = Math.max(...daily.map(d => d.count), 1);

  // API から渡された期間全体を表示（特定月を選択した場合にも対応）
  const recentDaily = daily;

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">日別スキャン数</h3>
      <div className="overflow-x-auto">
        <div className="flex items-end justify-start gap-2 h-32 min-w-max pr-2">
          {recentDaily.map((item, index) => {
            const height = (item.count / maxCount) * 100;
            const date = new Date(item.date);
            const dayStr = date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
            const weekday = date.toLocaleDateString('ja-JP', { weekday: 'short' });
            
            return (
              <div
                key={item.date}
                className="flex flex-col items-center gap-1 min-w-[40px]"
              >
                <span className="text-xs font-medium text-slate-600">{item.count}</span>
                <div
                  className="w-full rounded-t-md transition-all duration-300"
                  style={{
                    height: `${Math.max(height, 4)}%`,
                    backgroundColor: index === recentDaily.length - 1 ? '#10b981' : '#a7f3d0',
                  }}
                />
                <div className="text-center">
                  <p className="text-xs text-slate-500 leading-tight">{dayStr}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{weekday}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


