import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { rateAPI, adminAPI } from '../api';
import HistoryChart from '../components/HistoryChart';

/* ==========================================================================
   1. 基础配置与元数据 (Static)
   ========================================================================== */

const COIN_METADATA = {
    'BTC': { name: 'Bitcoin', letter: 'B', bgColor: 'bg-[#f87171]' },
    'ETH': { name: 'Ethereum', letter: 'E', bgColor: 'bg-[#60a5fa]' },
    'USDT': { name: 'Tether', letter: 'T', bgColor: 'bg-[#2dd4bf]' },
    'SOL': { name: 'Solana', letter: 'S', bgColor: 'bg-[#a78bfa]' },
    'BNB': { name: 'BNB', letter: 'B', bgColor: 'bg-[#fbbf24]' },
};

/* ==========================================================================
   2. UI 辅助组件 (Defined before Main)
   ========================================================================== */

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
 * 顶部大型概览卡片
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
 * 图表背景装饰
 */
const ChartPlaceholder = () => (
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
         style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
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

/**
 * 列表行组件 (CoinTableRow)
 */
const CoinTableRow = ({ coin, isExpanded, onToggle, isWatched, onToggleWatch }) => {
    // 防御性处理：确保 price 是字符串
    const displayPrice = coin?.price || '0';
    const rawPrice = parseFloat(displayPrice.toString().replace(/,/g, '')) || 0;
    const isUp = coin?.change24h?.toString()?.startsWith('+');

    return (
        <div 
            className={`group relative flex flex-col transition-all duration-500 overflow-hidden
                ${isExpanded ? 'my-4 ring-1 ring-slate-200 shadow-xl z-20' : 'hover:-translate-y-[1px]'}
            `}
        >
            {/* 主行容器 */}
            <div 
                className={`relative flex items-center gap-4 px-6 py-5 border-b border-slate-100/50 cursor-pointer transition-colors duration-300
                    ${isExpanded ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/30'}
                `}
                onClick={onToggle}
            >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${isExpanded ? 'bg-slate-900' : 'bg-slate-100 group-hover:bg-slate-200'}`}></div>
                
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

                <div className="w-12 text-center text-[13px] font-mono font-bold text-slate-300">{coin?.rank}</div>

                <div className="flex-[1.5] flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm ${coin?.bgColor || 'bg-slate-400'} flex-shrink-0`}>
                        {coin?.letter}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[16px] font-extrabold text-slate-800 leading-none">{coin?.name}</span>
                        <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-1.3">{coin?.symbol}</span>
                    </div>
                </div>

                <div className="flex-1 text-right text-[15px] font-bold text-slate-900 font-mono tracking-tight">${displayPrice}</div>

                <div className={`w-24 text-right text-[13px] font-bold font-mono ${coin?.hour1?.toString()?.startsWith('+') ? 'text-emerald-500' : coin?.hour1 === '0.00%' ? 'text-slate-400' : 'text-rose-500'}`}>
                    {coin?.hour1}
                </div>

                <div className={`w-24 text-right text-[13px] font-bold font-mono ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {coin?.change24h}
                </div>

                <div className="flex-1 text-right text-[14px] font-bold text-slate-800 font-mono tracking-tight">${coin?.marketCap}</div>

                <div className="w-32 flex justify-end pl-4 items-center gap-3">
                    <svg width="80" height="25" viewBox="0 0 100 40" className="overflow-visible opacity-80">
                        <path 
                            d={coin?.sparkPath || 'M0 20 L 100 20'} 
                            fill="none" 
                            stroke={isUp ? '#10b981' : '#f43f5e'} 
                            strokeWidth="2.5" 
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className={`text-slate-200 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-slate-900' : ''}`}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className={`w-full bg-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${isExpanded ? 'max-h-[600px] border-b border-slate-100' : 'max-h-0'}`}>
                <div className="p-8 flex flex-col xl:flex-row gap-10">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                {coin?.symbol}/USDT 核心交易指标
                            </h4>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm relative overflow-hidden">
                            <ChartPlaceholder />
                            <HistoryChart symbol={coin?.symbol} />
                        </div>
                    </div>

                    <div className="w-full xl:w-[320px] grid grid-cols-2 xl:grid-cols-1 gap-6 pt-2">
                        <DetailMetaItem label="24H 最高价" value={`$${(rawPrice * 1.05).toFixed(2)}`} />
                        <DetailMetaItem label="24H 最低价" value={`$${(rawPrice * 0.92).toFixed(2)}`} />
                        <DetailMetaItem label="流通总量" value={`19.65M ${coin?.symbol}`} />
                        <DetailMetaItem label="总市值排名" value={`第 ${coin?.rank} 名`} />
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
};

/* ==========================================================================
   3. 主组件 (Main Component)
   ========================================================================== */

export default function Home() {
    const { favorites = [], toggleFavorite } = useOutletContext();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCoinId, setExpandedCoinId] = useState(null);
    const [coins, setCoins] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // 'all' 或 'favorites'

    // 根据选项卡过滤显示的币种
    const filteredCoins = activeTab === 'all' 
        ? coins 
        : coins.filter(coin => (favorites || []).some(f => (typeof f === 'string' ? f : f?.symbol) === coin.id));

    const fetchLatestRates = async () => {
        try {
            const res = await rateAPI.getLatest();
            if (res && Array.isArray(res.data)) {
                const formatted = res.data
                    .filter(item => item && item.symbol && COIN_METADATA[item.symbol])
                    .map((item, index) => {
                        const symbol = item.symbol;
                        const rate = parseFloat(item.rate || 0);
                        const meta = COIN_METADATA[symbol];

                        // 1. 模拟 1H 和 24H 涨跌 (基于符号生成固定方向，避免跳变)
                        const seed = symbol.charCodeAt(0) + symbol.charCodeAt(symbol.length - 1);
                        const h1Val = ((seed % 10) / 5 - 1) * 0.5 + (Math.random() * 0.2); // -0.5% ~ +0.5%
                        const h24Val = ((seed % 20) / 10 - 1) * 3 + (Math.random() * 0.5); // -3% ~ +3%
                        
                        const h1 = (h1Val >= 0 ? '+' : '') + h1Val.toFixed(2) + '%';
                        const h24 = (h24Val >= 0 ? '+' : '') + h24Val.toFixed(2) + '%';

                        // 2. 模拟市值 (基于价格和大致供应量)
                        let supply = 19650000; // 默认 BTC 级别
                        if (symbol === 'ETH') supply = 120150000;
                        if (symbol === 'USDT') supply = 104000000000;
                        if (symbol === 'BNB') supply = 149000000;
                        if (symbol === 'SOL') supply = 444000000;
                        
                        const mcapRaw = rate * supply;
                        const mcap = mcapRaw > 1e12 
                            ? (mcapRaw/1e12).toFixed(2) + 'T' 
                            : mcapRaw > 1e9 
                                ? (mcapRaw/1e9).toFixed(2) + 'B' 
                                : (mcapRaw/1e6).toFixed(2) + 'M';

                        // 3. 模拟 7日走势 SVG 路径
                        let points = [];
                        for(let i=0; i<=10; i++) {
                            const x = i * 10;
                            const noise = Math.sin(i + (seed % 5)) * 10;
                            const y = 20 + noise + (h24Val * -2); // 趋势随 24h 涨跌偏移
                            points.push(`${x} ${Math.max(5, Math.min(35, y))}`);
                        }
                        const sparkPath = `M ${points.join(' L ')}`;

                        return {
                            id: symbol,
                            rank: index + 1,
                            ...meta,
                            symbol: symbol,
                            price: rate.toLocaleString(undefined, { minimumFractionDigits: 2 }),
                            hour1: h1,
                            change24h: h24,
                            changeType: h24Val >= 0 ? 'up' : 'down',
                            marketCap: mcap,
                            sparkPath: sparkPath
                        };
                    });
                setCoins(formatted);
            }
        } catch (err) {
            console.error('获取实时行情失败:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestRates();
    }, []);

    const isWatched = (symbol) => (favorites || []).some(f => (typeof f === 'string' ? f : f?.symbol) === symbol);
    const handleToggleExpand = (id) => setExpandedCoinId(prev => prev === id ? null : id);

    useEffect(() => {
        const searchSymbol = searchParams.get('search');
        if (searchSymbol) {
            setExpandedCoinId(searchSymbol.toUpperCase());
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
            <div className="fixed inset-0 z-0 bg-graph-paper pointer-events-none opacity-60"></div>
            <main className="relative z-10 max-w-[1440px] mx-auto px-10 pt-32">
                <section className="flex flex-wrap gap-8 mb-16">
                    <LargeStatCard title="全球加密货币总市值" value="2.45T" change="2.4%" trendType="up" />
                    <LargeStatCard title="24小时总交易量" value="84.2B" change="1.2%" trendType="down" />
                </section>

                <div className="flex items-center justify-between mb-8">
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                        <button 
                            onClick={() => setActiveTab('all')}
                            className={`px-7 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 ${activeTab === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            全部
                        </button>
                        <button 
                            onClick={() => setActiveTab('favorites')}
                            className={`px-7 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-300 ${activeTab === 'favorites' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            自选收藏
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={async () => {
                                if(window.confirm('是否同步过去一年的历史采样数据？')) {
                                    try {
                                        const res = await adminAPI.syncHistory(365);
                                        alert(res.msg || '同步成功');
                                        fetchLatestRates();
                                    } catch(e) { alert('同步失败: ' + e.message); }
                                }
                            }}
                            className="px-6 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[11px] font-bold hover:bg-emerald-100 transition-all"
                        >
                            同步历史数据
                        </button>
                        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-400 bg-white/50 px-4 py-2 rounded-full border border-slate-100/50">
                            <span>每页显示: 50</span>
                        </div>
                    </div>
                </div>

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

                <div className="flex flex-col">
                    {isLoading ? (
                        <MinimalSkeleton />
                    ) : (
                        (filteredCoins && filteredCoins.length > 0) ? (
                            filteredCoins.map(coin => (
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
                        ) : (
                            <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[13px]">
                                    {activeTab === 'all' ? '未检测到行情数据，请检查 API 配置或手动同步' : '您的自选收藏为空，快去添加关注吧'}
                                </p>
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}