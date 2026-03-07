import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Star, Activity, BarChart3, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { rateAPI, statsAPI } from '../api';
import { cryptoConfig, getCryptoDisplay, generateCandlestickData } from '../utils/cryptoHelper';
import { getDateRangeByTimeframe } from '../utils/dateUtils';

export default function Home() {
    const {
        user,
        setShowLoginPage,
        favorites,
        toggleFavorite,
        latestRates,
        error,
        setError
    } = useOutletContext();

    const navigate = useNavigate();

    const [selectedCrypto, setSelectedCrypto] = useState('BTC');
    const [activeTimeframe, setActiveTimeframe] = useState('1D');
    const [allSymbols, setAllSymbols] = useState([]);
    const [cryptoList, setCryptoList] = useState(['BTC', 'ETH', 'BNB']);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [chartData, setChartData] = useState([]);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [priceChange, setPriceChange] = useState(0);
    const [statsData, setStatsData] = useState(null);

    const [loading, setLoading] = useState({
        symbols: false,
        search: false,
        history: false,
        stats: false,
    });

    const searchDebounceRef = useRef(null);
    const timeframes = ['15M', '1H', '4H', '1D', '1W', '1M'];

    // 1. Fetch available symbols
    useEffect(() => {
        const fetchSymbols = async () => {
            try {
                setLoading(prev => ({ ...prev, symbols: true }));
                const response = await rateAPI.getSymbols();
                if (response.data && response.data.length > 0) {
                    setAllSymbols(response.data);
                    setCryptoList(response.data.slice(0, 20));
                }
            } catch (err) {
                setAllSymbols(['BTC', 'ETH', 'BNB']);
                setCryptoList(['BTC', 'ETH', 'BNB']);
            } finally {
                setLoading(prev => ({ ...prev, symbols: false }));
            }
        };
        fetchSymbols();
    }, []);

    // 2. Search Debounce
    useEffect(() => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

        const keyword = searchKeyword.trim();
        if (!keyword) {
            if (allSymbols.length > 0) setCryptoList(allSymbols.slice(0, 20));
            return;
        }

        searchDebounceRef.current = setTimeout(async () => {
            try {
                setLoading(prev => ({ ...prev, search: true }));
                const response = await rateAPI.searchSymbols(keyword);
                if (response.data && Array.isArray(response.data)) {
                    setCryptoList(response.data);
                }
            } catch (err) {
                setError('搜索失败，请稍后重试');
            } finally {
                setLoading(prev => ({ ...prev, search: false }));
            }
        }, 300);

        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, [searchKeyword, allSymbols, setError]);

    // 3. Update current price based on latestRates & selectedCrypto
    useEffect(() => {
        if (latestRates[selectedCrypto]) {
            setCurrentPrice(latestRates[selectedCrypto]);
        }
    }, [latestRates, selectedCrypto]);

    // 4. Fetch history and stats
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(prev => ({ ...prev, history: true, stats: true }));
                setError(null);

                const { start, end } = getDateRangeByTimeframe(activeTimeframe);
                const [historyResponse, statsResponse] = await Promise.all([
                    rateAPI.getHistory(selectedCrypto, start, end),
                    statsAPI.getSummary(selectedCrypto, '7d'),
                ]);

                if (historyResponse.data && Array.isArray(historyResponse.data)) {
                    const chartData = historyResponse.data.map((item, index) => {
                        const rate = item.rate || 0;
                        const volatility = rate * 0.02;
                        return {
                            time: item.date || index,
                            open: rate,
                            high: rate + Math.random() * volatility,
                            low: rate - Math.random() * volatility,
                            close: rate + (Math.random() - 0.5) * volatility,
                            volume: Math.random() * 1000 + 500,
                            isUp: Math.random() > 0.5,
                        };
                    });
                    setChartData(chartData);

                    if (chartData.length >= 2) {
                        const firstPrice = chartData[0].close;
                        const lastPrice = chartData[chartData.length - 1].close;
                        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
                        setPriceChange(change);
                    }
                } else {
                    const crypto = getCryptoDisplay(selectedCrypto);
                    setChartData(generateCandlestickData(crypto.basePrice));
                }

                if (statsResponse.data) {
                    setStatsData(statsResponse.data);
                }

            } catch (err) {
                setError(err.message || '获取数据失败');
                const crypto = getCryptoDisplay(selectedCrypto);
                setChartData(generateCandlestickData(crypto.basePrice));
            } finally {
                setLoading(prev => ({ ...prev, history: false, stats: false }));
            }
        };

        fetchData();
    }, [selectedCrypto, activeTimeframe, setError]);

    // Custom JSX / Variables
    const currentCrypto = getCryptoDisplay(selectedCrypto);
    const hasRealTimePrice = latestRates[selectedCrypto] !== undefined && latestRates[selectedCrypto] !== null;
    const displayPrice = hasRealTimePrice ? currentPrice : currentCrypto.basePrice;

    const isFavorited = (symbol) => {
        return favorites.some(f => (typeof f === 'string' ? f : f.symbol) === symbol);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload[0]) {
            const data = payload[0].payload;
            return (
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-lg">
                    <p className="text-xs text-gray-500 mb-2">时间: {data.time}</p>
                    <div className="space-y-1 text-sm">
                        <p className="text-gray-700">开: <span className="font-semibold">${data.open?.toFixed(2)}</span></p>
                        <p className="text-gray-700">高: <span className="font-semibold">${data.high?.toFixed(2)}</span></p>
                        <p className="text-gray-700">低: <span className="font-semibold">${data.low?.toFixed(2)}</span></p>
                        <p className="text-gray-700">收: <span className="font-semibold">${data.close?.toFixed(2)}</span></p>
                        <p className="text-gray-700">量: <span className="font-semibold">{data.volume?.toFixed(0)}</span></p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <aside className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
                <div className="p-4">
                    <div className="relative mb-4">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            placeholder="搜索币种（如 BTC、ETH）..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                        />
                        {loading.search && <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />}
                    </div>

                    {loading.symbols ? (
                        <div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
                    ) : (
                        <div className="space-y-1">
                            {cryptoList.length === 0 ? (
                                <div className="py-8 text-center text-sm text-gray-500">{searchKeyword.trim() ? '未找到匹配的币种' : '暂无币种数据'}</div>
                            ) : (
                                cryptoList.map((symbol) => {
                                    const crypto = getCryptoDisplay(symbol);
                                    const rate = latestRates[symbol] ?? crypto.basePrice;
                                    const change = (Math.random() - 0.3) * 5;
                                    const isPositive = change >= 0;

                                    return (
                                        <button
                                            key={symbol}
                                            onClick={() => setSelectedCrypto(symbol)}
                                            className={`w-full p-4 rounded-lg text-left transition-colors ${selectedCrypto === symbol ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-white'}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg">{crypto.icon}</div>
                                                    <div>
                                                        <div className="font-semibold text-sm">{symbol}</div>
                                                        <div className="text-xs text-gray-500">{crypto.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-semibold">${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{isPositive ? '+' : ''}{change.toFixed(2)}%</div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                <div className="border-b border-gray-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold">{selectedCrypto}/USDT</h2>
                                    <span className="text-sm text-gray-500">{currentCrypto.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl font-bold">${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    <div className={`flex items-center gap-1 px-3 py-1 rounded-md ${priceChange >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        <span className="text-sm font-semibold">{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <div><div className="text-gray-500 mb-1">24h 成交量</div><div className="font-semibold">{currentCrypto.volume24h}</div></div>
                            <div><div className="text-gray-500 mb-1">24h 最高</div><div className="font-semibold">${statsData?.maxValue?.toFixed(2) || (displayPrice * 1.05).toFixed(2)}</div></div>
                            <div><div className="text-gray-500 mb-1">24h 最低</div><div className="font-semibold">${statsData?.minValue?.toFixed(2) || (displayPrice * 0.95).toFixed(2)}</div></div>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-200 bg-white px-6 py-3">
                    <div className="flex items-center gap-2">
                        {timeframes.map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setActiveTimeframe(tf)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTimeframe === tf ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >{tf}</button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-white p-6 relative">
                    {loading.history ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                            <Loader2 size={40} className="animate-spin text-gray-400 mb-3" />
                            <p className="text-sm text-gray-500">加载图表数据...</p>
                        </div>
                    ) : chartData.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                            <AlertCircle size={40} className="text-gray-400 mb-3" />
                            <p className="text-sm text-gray-500">暂无数据</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                                <YAxis yAxisId="price" stroke="#9ca3af" style={{ fontSize: '12px' }} domain={['auto', 'auto']} tickFormatter={(value) => `$${value.toFixed(0)}`} />
                                <YAxis yAxisId="volume" orientation="right" stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[0, 'auto']} />
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Bar dataKey="volume" fill="#e5e7eb" opacity={0.3} yAxisId="volume" />
                                <Line yAxisId="price" type="monotone" dataKey="high" stroke="#10b981" strokeWidth={1} dot={false} />
                                <Line yAxisId="price" type="monotone" dataKey="low" stroke="#ef4444" strokeWidth={1} dot={false} />
                                <Line yAxisId="price" type="monotone" dataKey="close" stroke="#6b7280" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </main>

            <aside className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
                <div className="p-6 pb-8">
                    <div className="mb-6">
                        <button
                            onClick={() => toggleFavorite(selectedCrypto)}
                            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isFavorited(selectedCrypto) ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                        >
                            <Star size={20} fill={isFavorited(selectedCrypto) ? 'currentColor' : 'none'} />
                            {isFavorited(selectedCrypto) ? '已收藏' : '收藏'}
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 size={18} className="text-gray-600" />
                            <h3 className="text-sm font-semibold text-gray-900">市场统计</h3>
                        </div>
                        <div className="space-y-3 text-sm bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between"><span className="text-gray-600">最高价</span><span className="font-semibold">${statsData?.maxValue?.toFixed(2) || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">最低价</span><span className="font-semibold">${statsData?.minValue?.toFixed(2) || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">平均价</span><span className="font-semibold">${statsData?.avgValue?.toFixed(2) || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">价格变动</span><span className={`font-semibold ${(statsData?.priceChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{statsData?.priceChangePercent || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">24h 成交量</span><span className="font-semibold">{currentCrypto.volume24h}</span></div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={18} className="text-gray-600" />
                            <h3 className="text-sm font-semibold text-gray-900">价格变化</h3>
                        </div>
                        <div className="space-y-3 text-sm bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-center"><span className="text-gray-600">7天</span><span className="font-semibold text-green-600">+12.5%</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-600">30天</span><span className="font-semibold text-green-600">+28.3%</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-600">90天</span><span className="font-semibold text-red-600">-5.2%</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-600">1年</span><span className="font-semibold text-green-600">+145.8%</span></div>
                        </div>
                    </div>

                    {favorites.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Star size={18} className="text-gray-600" fill="currentColor" />
                                <h3 className="text-sm font-semibold text-gray-900">我的收藏</h3>
                                <span className="text-xs text-gray-500">({favorites.length})</span>
                            </div>
                            <div className="space-y-2">
                                {favorites.map(favItem => {
                                    const symbol = typeof favItem === 'string' ? favItem : favItem.symbol;
                                    const crypto = getCryptoDisplay(symbol);
                                    const rate = latestRates[symbol] || crypto.basePrice;
                                    const change = (Math.random() - 0.3) * 5;
                                    const isPositive = change >= 0;

                                    return (
                                        <button
                                            key={symbol}
                                            onClick={() => setSelectedCrypto(symbol)}
                                            className={`w-full p-3 rounded-lg text-left transition-colors ${selectedCrypto === symbol ? 'bg-white border border-gray-300 shadow-sm' : 'bg-white border border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{crypto.icon}</span>
                                                    <div>
                                                        <div className="text-sm font-semibold">{symbol}</div>
                                                        <div className="text-xs text-gray-500">{crypto.name}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-semibold">${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                <div className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>{isPositive ? '+' : ''}{change.toFixed(2)}%</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
