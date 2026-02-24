import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, TrendingUp, TrendingDown, Search, Star, Activity, BarChart3, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { rateAPI, statsAPI, analysisAPI } from './api';
import { getDateRangeByTimeframe } from './utils/dateUtils';
import Login from './pages/Login';

// 加密货币配置
const cryptoConfig = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    basePrice: 45000,
    color: '#FFD700',
    icon: '₿',
    volume24h: '28.5B'
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    basePrice: 2800,
    color: '#627EEA',
    icon: 'Ξ',
    volume24h: '15.2B'
  },
  BNB: {
    name: 'Binance Coin',
    symbol: 'BNB',
    basePrice: 320,
    color: '#F3BA2F',
    icon: 'Ⓑ',
    volume24h: '2.8B'
  }
};

// 获取币种显示配置（未配置的币种使用默认值）
const getCryptoDisplay = (symbol) => {
  return cryptoConfig[symbol] || {
    name: symbol,
    symbol,
    basePrice: 0,
    color: '#6b7280',
    icon: '◆',
    volume24h: '-'
  };
};

// 生成蜡烛图数据（K线图）
const generateCandlestickData = (basePrice) => {
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < 50; i++) {
    const open = currentPrice;
    const volatility = basePrice * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 1000 + 500;
    
    data.push({
      time: i,
      open,
      high,
      low,
      close,
      volume,
      isUp: close >= open
    });
    
    currentPrice = close;
  }
  return data;
};

// 自定义蜡烛图形状
const Candlestick = (props) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;
  
  const { open, high, low, close, isUp } = payload;
  const color = isUp ? '#10B981' : '#EF4444';
  const wickX = x + width / 2;
  
  // 计算y坐标
  const yHigh = y;
  const yLow = y + height;
  const yOpen = y + (high - open) / (high - low) * height;
  const yClose = y + (high - close) / (high - low) * height;
  
  return (
    <g>
      {/* 上下影线 */}
      <line x1={wickX} y1={yHigh} x2={wickX} y2={yLow} stroke={color} strokeWidth={1} />
      {/* 实体 */}
      <rect
        x={x}
        y={Math.min(yOpen, yClose)}
        width={width}
        height={Math.abs(yClose - yOpen) || 1}
        fill={color}
        opacity={0.9}
      />
    </g>
  );
};

const USER_STORAGE_KEY = 'cryptorate_user';

function App() {
  // 登录状态：从 localStorage 恢复，未登录时可打开登录页
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [showLoginPage, setShowLoginPage] = useState(false);

  // 基础状态
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [favorites, setFavorites] = useState(['BTC']); // 收藏列表
  const [showAiAnalysis, setShowAiAnalysis] = useState(false); // AI分析显示状态
  
  // 数据状态
  const [allSymbols, setAllSymbols] = useState([]); // 全部币种（用于清空搜索时恢复）
  const [cryptoList, setCryptoList] = useState(['BTC', 'ETH', 'BNB']); // 当前展示的币种列表
  const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词
  const [chartData, setChartData] = useState([]); // 图表数据
  const [currentPrice, setCurrentPrice] = useState(0); // 当前价格
  const [priceChange, setPriceChange] = useState(0); // 涨跌幅
  const [latestRates, setLatestRates] = useState({}); // 最新汇率数据
  const [statsData, setStatsData] = useState(null); // 统计数据
  const [aiAnalysis, setAiAnalysis] = useState(''); // AI分析内容
  
  // 加载状态
  const [loading, setLoading] = useState({
    symbols: false,
    search: false,
    latest: false,
    history: false,
    stats: false,
    analysis: false,
  });
  
  // 错误状态
  const [error, setError] = useState(null);
  
  // 搜索防抖定时器
  const searchDebounceRef = useRef(null);

  // 拦截器：任意接口返回 401 时清除登录态并打开登录页
  useEffect(() => {
    const onAuthLogout = () => {
      setUser(null);
      setShowLoginPage(true);
    };
    window.addEventListener('auth:logout', onAuthLogout);
    return () => window.removeEventListener('auth:logout', onAuthLogout);
  }, []);

  const timeframes = ['15M', '1H', '4H', '1D', '1W', '1M'];
  
  // 切换收藏
  const toggleFavorite = (symbol) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  // 初始化：获取支持的币种列表
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        setLoading(prev => ({ ...prev, symbols: true }));
        const response = await rateAPI.getSymbols();
        if (response.data && response.data.length > 0) {
          setAllSymbols(response.data);
          // 默认展示前 20 个币种
          setCryptoList(response.data.slice(0, 20));
        }
      } catch (err) {
        console.error('获取币种列表失败:', err);
        setAllSymbols(['BTC', 'ETH', 'BNB']);
        setCryptoList(['BTC', 'ETH', 'BNB']);
      } finally {
        setLoading(prev => ({ ...prev, symbols: false }));
      }
    };

    fetchSymbols();
  }, []);

  // 搜索：防抖后调用后端搜索接口
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    const keyword = searchKeyword.trim();
    if (!keyword) {
      // 清空搜索时恢复为全部币种（前20个）
      if (allSymbols.length > 0) {
        setCryptoList(allSymbols.slice(0, 20));
      }
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
        console.error('搜索币种失败:', err);
        setError('搜索失败，请稍后重试');
      } finally {
        setLoading(prev => ({ ...prev, search: false }));
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchKeyword, allSymbols]);

  // 获取最新汇率数据
  useEffect(() => {
    const fetchLatestRates = async () => {
      try {
        setLoading(prev => ({ ...prev, latest: true }));
        const response = await rateAPI.getLatest();
        
        if (response.data && Array.isArray(response.data)) {
          // 转换为 {symbol: rate} 格式
          const ratesMap = {};
          response.data.forEach(item => {
            ratesMap[item.symbol] = item.rate;
          });
          setLatestRates(ratesMap);
          
          // 更新当前选中币种的价格
          const selectedRate = response.data.find(item => item.symbol === selectedCrypto);
          if (selectedRate) {
            setCurrentPrice(selectedRate.rate);
          }
        }
      } catch (err) {
        console.error('获取最新汇率失败:', err);
        setError('获取最新汇率失败，请检查后端服务');
      } finally {
        setLoading(prev => ({ ...prev, latest: false }));
      }
    };

    fetchLatestRates();
    // 每30秒刷新一次
    const interval = setInterval(fetchLatestRates, 30000);
    return () => clearInterval(interval);
  }, [selectedCrypto]);

  // 获取历史数据和统计信息
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, history: true, stats: true }));
        setError(null);

        // 获取日期范围
        const { start, end } = getDateRangeByTimeframe(activeTimeframe);

        // 并行请求历史数据和统计信息
        const [historyResponse, statsResponse] = await Promise.all([
          rateAPI.getHistory(selectedCrypto, start, end),
          statsAPI.getSummary(selectedCrypto, '7d'),
        ]);

        // 处理历史数据
        if (historyResponse.data && Array.isArray(historyResponse.data)) {
          // 转换为K线图格式
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
          
          // 计算涨跌幅
          if (chartData.length >= 2) {
            const firstPrice = chartData[0].close;
            const lastPrice = chartData[chartData.length - 1].close;
            const change = ((lastPrice - firstPrice) / firstPrice) * 100;
            setPriceChange(change);
          }
        } else {
          // 如果没有历史数据，使用模拟数据
          const crypto = cryptoConfig[selectedCrypto];
          setChartData(generateCandlestickData(crypto.basePrice));
        }

        // 处理统计数据
        if (statsResponse.data) {
          setStatsData(statsResponse.data);
        }

      } catch (err) {
        console.error('获取数据失败:', err);
        setError(err.message || '获取数据失败');
        // 使用模拟数据作为降级方案
        const crypto = cryptoConfig[selectedCrypto];
        setChartData(generateCandlestickData(crypto.basePrice));
      } finally {
        setLoading(prev => ({ ...prev, history: false, stats: false }));
      }
    };

    fetchData();
  }, [selectedCrypto, activeTimeframe]);

  // 加载AI分析
  const loadAiAnalysis = async () => {
    if (aiAnalysis) {
      setShowAiAnalysis(!showAiAnalysis);
      return;
    }

    try {
      setLoading(prev => ({ ...prev, analysis: true }));
      const response = await analysisAPI.getExplanation(selectedCrypto);
      
      if (response.data && response.data.report) {
        setAiAnalysis(response.data.report);
        setShowAiAnalysis(true);
      }
    } catch (err) {
      console.error('获取AI分析失败:', err);
      // 使用模拟数据
      setAiAnalysis(`${selectedCrypto} 在过去 24 小时内价格表现平稳。最高价格为 $${(currentPrice * 1.05).toFixed(2)}，最低为 $${(currentPrice * 0.95).toFixed(2)}。整体呈现平稳趋势，涨跌幅为 ${priceChange.toFixed(2)}%。`);
      setShowAiAnalysis(true);
    } finally {
      setLoading(prev => ({ ...prev, analysis: false }));
    }
  };

  // 获取当前加密货币配置
  const currentCrypto = getCryptoDisplay(selectedCrypto);

  // 自定义 Tooltip
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

  // 当前选中币种是否有后端返回的实时价格（无则为参考价，与真实行情可能不一致）
  const hasRealTimePrice = latestRates[selectedCrypto] !== undefined && latestRates[selectedCrypto] !== null;
  // 展示用价格：有实时用实时，否则用参考价，避免显示 0
  const displayPrice = hasRealTimePrice ? currentPrice : currentCrypto.basePrice;

  // 显示登录页时只渲染登录组件
  if (showLoginPage) {
    return (
      <Login
        onSuccess={(userData) => {
          setUser(userData);
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
          } catch (_) {}
          setShowLoginPage(false);
        }}
        onCancel={() => setShowLoginPage(false)}
      />
    );
  }

  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col overflow-hidden">
      {/* 无实时价格时的说明条 */}
      {!loading.latest && !hasRealTimePrice && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2 text-sm text-amber-800">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>当前价格为参考显示，非实时行情（API 限额已用尽或尚未同步数据）。搜索与列表可正常使用。</span>
        </div>
      )}
      {/* 全局错误提示 */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-gray-900">CryptoRate</h1>
            <nav className="flex gap-6">
              <button className="text-sm font-medium text-gray-900 border-b-2 border-gray-900 pb-1">市场</button>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-1">收藏</button>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-1">分析</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={20} className="text-gray-600" />
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.username}</span>
                <button
                  onClick={() => {
                    setUser(null);
                    try {
                      localStorage.removeItem(USER_STORAGE_KEY);
                    } catch (_) {}
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  退出
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginPage(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Left Sidebar - Crypto List */}
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
              {loading.search && (
                <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
              )}
            </div>
            
            {loading.symbols ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-1">
                {cryptoList.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    {searchKeyword.trim() ? '未找到匹配的币种' : '暂无币种数据'}
                  </div>
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
                      className={`w-full p-4 rounded-lg text-left transition-colors ${
                        selectedCrypto === symbol
                          ? 'bg-white shadow-sm border border-gray-200'
                          : 'hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg">
                            {crypto.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{symbol}</div>
                            <div className="text-xs text-gray-500">{crypto.name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">
                          ${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{change.toFixed(2)}%
                        </div>
                      </div>
                    </button>
                  );
                })
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Center - Chart Area */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Price Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            {loading.latest ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={24} className="animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">加载价格数据...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{selectedCrypto}/USDT</h2>
                      <span className="text-sm text-gray-500">{currentCrypto.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold">
                        ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-md ${
                        priceChange >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {priceChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="text-sm font-semibold">
                          {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <div className="text-gray-500 mb-1">24h 成交量</div>
                    <div className="font-semibold">{currentCrypto.volume24h}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">24h 最高</div>
                    <div className="font-semibold">
                      ${statsData?.maxValue?.toFixed(2) || (displayPrice * 1.05).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 mb-1">24h 最低</div>
                    <div className="font-semibold">
                      ${statsData?.minValue?.toFixed(2) || (displayPrice * 0.95).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeframe Selector */}
          <div className="border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex items-center gap-2">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTimeframe === tf
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
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
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    yAxisId="price"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value.toFixed(0)}`}
                  />
                  <YAxis 
                    yAxisId="volume"
                    orientation="right"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* 成交量柱状图 */}
                  <Bar 
                    dataKey="volume" 
                    fill="#e5e7eb" 
                    opacity={0.3}
                    yAxisId="volume"
                  />
                  
                  {/* K线图 - 用线条模拟 */}
                  <Line 
                    yAxisId="price"
                    type="monotone" 
                    dataKey="high" 
                    stroke="#10b981" 
                    strokeWidth={1}
                    dot={false}
                  />
                  <Line 
                    yAxisId="price"
                    type="monotone" 
                    dataKey="low" 
                    stroke="#ef4444" 
                    strokeWidth={1}
                    dot={false}
                  />
                  <Line 
                    yAxisId="price"
                    type="monotone" 
                    dataKey="close" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </main>

        {/* Right Sidebar - Info & Analysis Panel */}
        <aside className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
          <div className="p-6 pb-8">
            {/* 收藏按钮 */}
            <div className="mb-6">
              <button 
                onClick={() => toggleFavorite(selectedCrypto)}
                className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  favorites.includes(selectedCrypto)
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Star 
                  size={20} 
                  fill={favorites.includes(selectedCrypto) ? 'currentColor' : 'none'}
                />
                {favorites.includes(selectedCrypto) ? '已收藏' : '收藏'}
              </button>
            </div>

            {/* 市场统计 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">市场统计</h3>
              </div>
              {loading.stats ? (
                <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-3 text-sm bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">最高价</span>
                    <span className="font-semibold">
                      ${statsData?.maxValue?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最低价</span>
                    <span className="font-semibold">
                      ${statsData?.minValue?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均价</span>
                    <span className="font-semibold">
                      ${statsData?.avgValue?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">价格变动</span>
                    <span className={`font-semibold ${(statsData?.priceChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {statsData?.priceChangePercent || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">24h 成交量</span>
                    <span className="font-semibold">{currentCrypto.volume24h}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 价格变化指标 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">价格变化</h3>
              </div>
              <div className="space-y-3 text-sm bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">7天</span>
                  <span className="font-semibold text-green-600">+12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">30天</span>
                  <span className="font-semibold text-green-600">+28.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">90天</span>
                  <span className="font-semibold text-red-600">-5.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">1年</span>
                  <span className="font-semibold text-green-600">+145.8%</span>
                </div>
              </div>
            </div>

            {/* AI 分析 */}
            <div className="mb-6">
              <button
                onClick={loadAiAnalysis}
                disabled={loading.analysis}
                className="w-full mb-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.analysis ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    AI 市场分析
                  </>
                )}
              </button>
              
              {showAiAnalysis && aiAnalysis && (
                <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles size={16} className="text-purple-600 mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900 mb-2">AI 分析报告</p>
                      <p className="text-gray-600 leading-relaxed">
                        {aiAnalysis}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                    * AI 分析仅供参考，不构成投资建议
                  </div>
                </div>
              )}
            </div>

            {/* 我的收藏列表 */}
            {favorites.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star size={18} className="text-gray-600" fill="currentColor" />
                  <h3 className="text-sm font-semibold text-gray-900">我的收藏</h3>
                  <span className="text-xs text-gray-500">({favorites.length})</span>
                </div>
                <div className="space-y-2">
                  {favorites.map(symbol => {
                    const crypto = cryptoConfig[symbol];
                    const rate = latestRates[symbol] || crypto.basePrice;
                    const change = (Math.random() - 0.3) * 5;
                    const isPositive = change >= 0;
                    
                    return (
                      <button
                        key={symbol}
                        onClick={() => setSelectedCrypto(symbol)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedCrypto === symbol
                            ? 'bg-white border border-gray-300 shadow-sm'
                            : 'bg-white border border-gray-200 hover:border-gray-300'
                        }`}
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
                          <div className="text-sm font-semibold">
                            ${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
