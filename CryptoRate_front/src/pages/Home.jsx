import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';

/**
 * 极简骨架屏
 */
const MinimalSkeleton = () => (
    <div className="w-full space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-100 shadow-sm"></div>
        ))}
    </div>
);

/**
 * 模拟行情数据 - 适配最新设计图
 */
const MOCK_COINS = [
    { id: 'BTC', rank: 1, name: 'Bitcoin', symbol: 'BTC', letter: 'B', bgColor: 'bg-[#f87171]', price: '64,230.50', hour1: '-0.12%', change24h: '+1.45%', changeType: 'up', marketCap: '1,264.8B', sparkPath: 'M0 30 Q 25 10, 50 25 T 100 5' },
    { id: 'ETH', rank: 2, name: 'Ethereum', symbol: 'ETH', letter: 'E', bgColor: 'bg-[#60a5fa]', price: '3,450.75', hour1: '+0.45%', change24h: '+2.10%', changeType: 'up', marketCap: '415.6B', sparkPath: 'M0 35 Q 25 10, 50 30 T 100 10' },
    { id: 'USDT', rank: 3, name: 'Tether', symbol: 'USDT', letter: 'T', bgColor: 'bg-[#2dd4bf]', price: '1.00', hour1: '0.00%', change24h: '-0.01%', changeType: 'neutral', marketCap: '104.1B', sparkPath: 'M0 20 L 100 20' },
    { id: 'SOL', rank: 4, name: 'Solana', symbol: 'SOL', letter: 'S', bgColor: 'bg-[#a78bfa]', price: '145.20', hour1: '-1.20%', change24h: '-4.50%', changeType: 'down', marketCap: '65.4B', sparkPath: 'M0 10 Q 25 30, 50 15 T 100 35' },
    { id: 'BNB', rank: 5, name: 'BNB', symbol: 'BNB', letter: 'B', bgColor: 'bg-[#fbbf24]', price: '580.45', hour1: '+0.15%', change24h: '+0.80%', changeType: 'up', marketCap: '86.7B', sparkPath: 'M0 25 Q 25 25, 50 10 T 100 5' },
];

/**
 * 顶部大型概览卡片 - 采用参考图样式
 */
const LargeStatCard = ({ title, value, change, trendType }) => (
    <div className="bg-white p-8 border border-slate-100 shadow-sm relative overflow-hidden chamfer-card min-w-[340px] flex-1">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-100"></div>
        <p className="text-[13px] font-bold text-slate-400 mb-3 tracking-tight">{title}</p>
        <div className="flex items-baseline gap-4">
            <h2 className="text-[32px] font-bold text-slate-900 tracking-tighter font-mono">${value}</h2>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[13px] font-bold ${trendType === 'up' ? 'text-emerald-500 bg-emerald-50/50' : 'text-rose-500 bg-rose-50/50'}`}>
                {trendType === 'up' ? '↗' : '↘'} {change} <span className="text-[11px] opacity-60">24h</span>
            </div>
        </div>
    </div>
);

/**
 * K 线蜡烛图占位组件 (Candlestick Chart Placeholder)
 */
const CoinCandleChart = ({ symbol, changeType }) => (
    <div className="w-full h-72 bg-slate-50/80 rounded-2xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden group">
        {/* 模拟背景网格线 */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* 图标/提示文字 */}
        <div className="relative flex flex-col items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${changeType === 'up' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} animate-pulse`}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l5 5 5-5M7 8l5-5 5 5"></path>
                </svg>
            </div>
            <div className="text-center">
                <p className="text-[14px] font-bold text-slate-800">{symbol} 实时动态行情图表</p>
                <p className="text-[12px] text-slate-400 mt-1">深度集成 TradingView / Canvas 渲染引擎中...</p>
            </div>
        </div>
    </div>
);

/**
 * 列表行组件 (CoinTableRow) - 包含点击展开逻辑
 */
const CoinTableRow = ({ coin, isExpanded, onToggle, isWatched, onToggleWatch }) => (
    <div 
        className={`group relative flex flex-col transition-all duration-500 cursor-pointer overflow-hidden
            ${isExpanded ? 'my-4 ring-1 ring-slate-200 shadow-xl z-20' : 'hover:-translate-y-[1px]'}
        `}
        onClick={onToggle}
    >
        {/* 主行容器 */}
        <div className={`relative flex items-center gap-4 px-6 py-5 border-b border-slate-100/50 transition-colors duration-300
            ${isExpanded ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/30'}
        `}>
            {/* 左侧物理状态条 */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${isExpanded ? 'bg-slate-900' : 'bg-slate-100 group-hover:bg-slate-200'}`}></div>
            
            {/* 关注状态 */}
            <div className="w-10 flex justify-center">
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleWatch(coin.id); }} 
                    className={`transition-all duration-300 ${isWatched ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-slate-300'}`}
                >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            </div>

            {/* 排名 */}
            <div className="w-12 text-center text-[13px] font-mono font-bold text-slate-300">{coin.rank}</div>

            {/* 资产信息 */}
            <div className="flex-[1.5] flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${coin.bgColor} flex-shrink-0`}>
                    {coin.letter}
                </div>
                <div className="flex flex-col">
                    <span className="text-[16px] font-extrabold text-slate-800 leading-none">{coin.name}</span>
                    <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-1.3">{coin.symbol}</span>
                </div>
            </div>

            {/* 价格 */}
            <div className="flex-1 text-right text-[15px] font-bold text-slate-900 font-mono tracking-tight">${coin.price}</div>

            {/* 1H 涨跌 */}
            <div className={`w-24 text-right text-[13px] font-bold font-mono ${coin.hour1.startsWith('+') ? 'text-emerald-500' : coin.hour1 === '0.00%' ? 'text-slate-400' : 'text-rose-500'}`}>
                {coin.hour1}
            </div>

            {/* 24H 涨跌 */}
            <div className={`w-24 text-right text-[13px] font-bold font-mono ${coin.change24h.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                {coin.change24h}
            </div>

            {/* 总市值 */}
            <div className="flex-1 text-right text-[14px] font-bold text-slate-800 font-mono tracking-tight">${coin.marketCap}</div>

            {/* 7日走势预览 */}
            <div className="w-32 flex justify-end pl-4 items-center gap-3">
                <svg width="80" height="25" viewBox="0 0 100 40" className="overflow-visible opacity-80">
                    <path 
                        d={coin.sparkPath} 
                        fill="none" 
                        stroke={coin.change24h.startsWith('+') ? '#10b981' : coin.change24h.startsWith('-') ? '#f43f5e' : '#94a3b8'} 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                    />
                </svg>
                {/* 展开箭头指示 */}
                <div className={`text-slate-200 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-slate-900' : ''}`}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>

        {/* 展开 Drawer - 动效核心 */}
        <div 
            className={`w-full bg-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden
                ${isExpanded ? 'max-h-[600px] border-b border-slate-100' : 'max-h-0'}
            `}
        >
            <div className="p-8 flex flex-col xl:flex-row gap-10">
                {/* 左侧主要图表展示区 */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            {coin.symbol}/USDT 核心交易指标
                        </h4>
                        <div className="flex gap-2">
                            {['1H', '4H', '1D', '1W'].map(t => (
                                <button key={t} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-colors ${t === '1D' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <CoinCandleChart symbol={coin.symbol} changeType={coin.changeType} />
                </div>

                {/* 右侧深度详情区 (附加面版) */}
                <div className="w-full xl:w-[320px] grid grid-cols-2 xl:grid-cols-1 gap-6 pt-2">
                    <DetailMetaItem label="24H 最高价" value={`$${(parseFloat(coin.price.replace(',','')) * 1.05).toFixed(2)}`} />
                    <DetailMetaItem label="24H 最低价" value={`$${(parseFloat(coin.price.replace(',','')) * 0.92).toFixed(2)}`} />
                    <DetailMetaItem label="流通总量" value="19.65M BTC" />
                    <DetailMetaItem label="总市值排名" value={`第 ${coin.rank} 名`} />
                    <div className="col-span-2 xl:col-span-1 pt-4">
                        <button className="w-full py-4 bg-slate-900 text-white text-[13px] font-bold rounded-2xl shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 transition-all active:scale-95">
                            进入资产详情中心 →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * 详情项辅助组件
 */
const DetailMetaItem = ({ label, value }) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{label}</span>
        <span className="text-[16px] font-bold text-slate-800 font-mono tracking-tight">{value}</span>
        <div className="w-full h-px bg-slate-100 mt-1"></div>
    </div>
);

export default function Home() {
    const { favorites, toggleFavorite } = useOutletContext();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCoinId, setExpandedCoinId] = useState(null); // 展开状态管理

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const isWatched = (symbol) => favorites.some(f => (typeof f === 'string' ? f : f.symbol) === symbol);
    const handleToggleExpand = (id) => setExpandedCoinId(prev => prev === id ? null : id);

    // 监听搜索参数并自动展开/定位
    useEffect(() => {
        const searchSymbol = searchParams.get('search');
        if (searchSymbol) {
            setExpandedCoinId(searchSymbol.toUpperCase());
            // 延迟一会等组件渲染完毕后滚动
            setTimeout(() => {
                const element = document.getElementById(`coin-row-${searchSymbol.toUpperCase()}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }, [searchParams]);

    return (
        <div className="relative w-full min-h-screen bg-slate-50 font-sans pb-24">
            {/* 网格背景 */}
            <div className="fixed inset-0 z-0 bg-graph-paper pointer-events-none opacity-60"></div>

            <main className="relative z-10 max-w-[1440px] mx-auto px-10 pt-32">
                
                {/* 1. 顶部数据概览 */}
                <section className="flex flex-wrap gap-8 mb-16">
                    <LargeStatCard title="全球加密货币总市值" value="2.45T" change="2.4%" trendType="up" />
                    <LargeStatCard title="24小时总交易量" value="84.2B" change="1.2%" trendType="down" />
                    <div className="flex-[1.5] hidden xl:block"></div>
                </section>

                {/* 2. 标题与控制 */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        <button className="px-7 py-2.5 bg-slate-900 text-white shadow-lg shadow-slate-900/10 rounded-xl text-[12px] font-bold">全部</button>
                        <button className="px-7 py-2.5 text-slate-400 hover:text-slate-600 rounded-xl text-[12px] font-bold transition-colors">自选收藏</button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[13px] font-bold text-slate-400 bg-white/50 px-4 py-2 rounded-full border border-slate-100/50">
                        <span>每页显示: 50</span>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* 3. 极速表头 */}
                <div className="flex items-center gap-4 px-6 py-4 mb-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100/50">
                    <div className="w-10 text-center text-slate-200">★</div>
                    <div className="w-12 text-center">#</div>
                    <div className="flex-[1.5]">资产 (ASSET)</div>
                    <div className="flex-1 text-right">价格 (PRICE)</div>
                    <div className="w-24 text-right">1H</div>
                    <div className="w-24 text-right">24H</div>
                    <div className="flex-1 text-right">总市值 (MAP)</div>
                    <div className="w-32 text-right">7日走势</div>
                </div>

                {/* 4. 行情列表 - Accordion Effect */}
                <div className="flex flex-col">
                    {isLoading ? (
                        <MinimalSkeleton />
                    ) : (
                        MOCK_COINS.map(coin => (
                            <div key={coin.id} id={`coin-row-${coin.id}`}>
                                <CoinTableRow 
                                    coin={coin} 
                                    isExpanded={expandedCoinId === coin.id}
                                    onToggle={() => handleToggleExpand(coin.id)}
                                    isWatched={isWatched(coin.id)} 
                                    onToggleWatch={toggleFavorite}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* 加载更多 */}
                {!isLoading && (
                    <div className="mt-16 flex justify-center">
                        <button className="px-10 py-3 bg-white border border-slate-100 text-[13px] font-bold text-slate-500 rounded-xl hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm">
                            加载更多数据
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}