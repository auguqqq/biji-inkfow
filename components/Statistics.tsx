
import React, { useMemo } from 'react';
import { WritingStats } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface StatisticsProps {
  stats: WritingStats;
}

const Statistics: React.FC<StatisticsProps> = ({ stats }) => {
  // Generate last 7 days chart data based on real history
  const chartData = useMemo(() => {
    const data = [];
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      data.push({
        name: days[d.getDay()],
        count: stats.writingHistory[key] || 0,
        key
      });
    }
    return data;
  }, [stats.writingHistory]);

  // Calculate actual writing streak
  const streak = useMemo(() => {
    let count = 0;
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    
    // Start checking from today backwards
    let currentKey = todayKey;
    let d = new Date(now);

    // If wrote today, count starts at 1, otherwise check yesterday
    if (stats.writingHistory[todayKey]) {
      count = 1;
    } else {
      // If didn't write today, check if streak ended yesterday
      d.setDate(d.getDate() - 1);
      currentKey = d.toISOString().split('T')[0];
      if (!stats.writingHistory[currentKey]) return 0;
      count = 0; // Will be incremented in the loop
    }

    // Go backwards to find consecutive days with writing > 0
    while (stats.writingHistory[currentKey] > 0) {
      if (currentKey !== todayKey) count++;
      d.setDate(d.getDate() - 1);
      currentKey = d.toISOString().split('T')[0];
    }
    
    return count;
  }, [stats.writingHistory]);

  return (
    <div className="p-6 space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">今日累计</p>
          <p className="text-3xl font-bold text-amber-900">{stats.dailyCount}</p>
          <p className="text-xs text-amber-500 mt-1">有效汉字</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">连续创作</p>
          <p className="text-3xl font-bold text-emerald-900">{streak}</p>
          <p className="text-xs text-emerald-500 mt-1">坚持天数</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-500 mb-4 px-1">本周产量趋势</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 6 ? '#d97706' : '#d1d5db'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 mb-2">坚持记录 (最近30天)</h4>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 30 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            const key = d.toISOString().split('T')[0];
            const hasWritten = stats.writingHistory[key] > 0;
            return (
              <div 
                  key={i} 
                  title={`${key}: ${stats.writingHistory[key] || 0}字`}
                  className={`w-4 h-4 rounded-sm transition-colors ${hasWritten ? 'bg-amber-400' : 'bg-gray-200'}`} 
              />
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2">
            {streak > 0 ? `状态正佳！已连续创作 ${streak} 天` : '今天还没动笔哦，加油！'}
        </p>
      </div>
    </div>
  );
};

export default Statistics;
