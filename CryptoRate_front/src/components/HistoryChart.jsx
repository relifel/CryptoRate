import React, { useState, useEffect, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { rateAPI } from '../api';

/**
 * 自定义 Tooltip 组件 - 提升论文截图质感
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-[15px] font-mono font-bold text-white">
          ${parseFloat(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * 毕业论文专用行情图表组件
 * @param {string} symbol - 币种代码
 */
export default function HistoryChart({ symbol }) {
  const [range, setRange] = useState('实时');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const ranges = [
    { label: '实时', days: 7 },
    { label: '1月', days: 30 },
    { label: '3月', days: 90 },
    { label: '1年', days: 365 },
  ];

  useEffect(() => {
    if (!symbol) return;
    
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const selectedRange = ranges.find(r => r.label === range);
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - (selectedRange?.days || 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const res = await rateAPI.getHistory(symbol, start, end);
        if (isMounted && res && Array.isArray(res.data)) {
          const formatted = res.data.map(item => ({
            date: item.date,
            price: item.rate,
            displayDate: item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
          }));
          setData(formatted);
        }
      } catch (err) {
        console.error(`获取 ${symbol} 历史数据失败:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [symbol, range]);

  const stats = useMemo(() => {
    if (!data || data.length < 1) return { isUp: true, diff: '0.00' };
    const first = parseFloat(data[0]?.price || 0);
    const last = parseFloat(data[data.length - 1]?.price || 0);
    const isUp = last >= first;
    const diff = first > 0 ? (((last / first) - 1) * 100).toFixed(2) : '0.00';
    return { isUp, diff, first, last };
  }, [data]);

  const themeColor = stats.isUp ? '#10b981' : '#f43f5e';

  if (!symbol) return <div className="h-64 flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-[11px]">Symbol Missing</div>;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-slate-300 animate-pulse' : (stats.isUp ? 'bg-emerald-500' : 'bg-rose-500')}`}></div>
          <h4 className="text-[13px] font-bold text-slate-800 uppercase tracking-tight">
            {symbol} / USD {range}行情趋势
          </h4>
        </div>
        
        <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100 font-mono">
          {ranges.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.label)}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                range === r.label 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorPrice-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="displayDate" 
              hide={range === '实时'} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              minTickGap={30}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={themeColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#colorPrice-${symbol})`} 
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex items-center justify-between px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        <div className="flex gap-6">
          <span>起始价: ${stats.first?.toLocaleString()}</span>
          <span>当前价: ${stats.last?.toLocaleString()}</span>
        </div>
        <div className={stats.isUp ? 'text-emerald-500' : 'text-rose-500'}>
          {stats.isUp ? '↑' : '↓'} {stats.diff}%
        </div>
      </div>
    </div>
  );
}
