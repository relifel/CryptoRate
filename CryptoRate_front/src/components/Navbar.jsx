import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Loader2, X } from 'lucide-react';
import { rateAPI } from '../api';

/**
 * 精准还原参考图：
 * 1. Logo: 黄色微光方块 + CryptoRate
 * 2. Nav: 极简灰阶，AI 智能分析带脉冲点
 * 3. Button: 带辉光的黄色胶囊按钮
 */
export default function Navbar({ user, setShowLoginPage, onLogout }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const searchTimeout = useRef(null);

    const isActive = (path) => location.pathname === path;

    // 搜索逻辑
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setShowResults(true);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await rateAPI.searchSymbols(query);
                if (res && res.data) {
                    setResults(res.data);
                }
            } catch (err) {
                console.error('搜索失败:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);
    };

    const handleSelectResult = (symbol) => {
        setSearchQuery('');
        setShowResults(false);
        navigate(`/?search=${symbol}`);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <header className="fixed top-0 left-0 w-full z-50 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-2 group">
                <div className="relative flex items-center justify-center">
                    {/* 微型黄色光晕背景 */}
                    <div className="absolute w-4 h-4 bg-yellow-400 blur-md opacity-30 group-hover:opacity-60 transition-opacity"></div>
                    {/* 黄色实心小方块 */}
                    <div className="relative w-2 h-2 bg-[#fef08a] rounded-[1px] shadow-[0_0_8px_rgba(254,240,138,1)]"></div>
                </div>
                <span className="text-[19px] font-bold text-slate-800 tracking-tight ml-1">
                    CryptoRate
                </span>
            </Link>

            {/* Navigation Links - 紧凑布局 */}
            <nav className="flex items-center gap-7">
                <Link 
                    to="/" 
                    className={`text-[15px] font-bold transition-all ${isActive('/') ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    大盘行情
                </Link>
                <Link 
                    to="/assets" 
                    className={`text-[15px] font-bold transition-all ${isActive('/assets') ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    我的资产
                </Link>
                <Link 
                    to="/favorites" 
                    className={`text-[15px] font-bold transition-all ${isActive('/favorites') ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    我的收藏
                </Link>
                <Link 
                    to="/analysis" 
                    className={`flex items-center gap-2 text-[15px] font-bold transition-all ${isActive('/analysis') ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    AI 智能分析
                    {/* 特色：AI 动态脉冲点 */}
                    <div className="relative flex items-center justify-center w-2 h-2">
                        <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-60"></div>
                        <div className="relative w-1.5 h-1.5 bg-teal-500 rounded-full shadow-[0_0_5px_rgba(20,184,166,0.6)]"></div>
                    </div>
                </Link>
            </nav>

            {/* Search and User Actions */}
            <div className="flex items-center gap-6">
                {/* Search Bar Component */}
                <div className="relative w-64 xl:w-80 group" ref={searchRef}>
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        {isSearching ? (
                            <Loader2 size={16} className="text-slate-400 animate-spin" />
                        ) : (
                            <Search size={16} className={`transition-colors ${searchQuery ? 'text-slate-800' : 'text-slate-400 group-focus-within:text-slate-800'}`} />
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="搜索资产 (如 BTC, ETH)..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => searchQuery && setShowResults(true)}
                        className="w-full bg-slate-50 border border-slate-100 py-2.5 pl-11 pr-10 rounded-2xl text-[13px] font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 focus:border-slate-300 transition-all shadow-sm"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => { setSearchQuery(''); setShowResults(false); }}
                            className="absolute inset-y-0 right-3 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.12)] overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
                            {results && results.length > 0 ? (
                                <div className="p-2 max-h-80 overflow-y-auto">
                                    {results.map((coin, index) => {
                                        const symbol = typeof coin === 'string' ? coin : coin?.symbol;
                                        const name = typeof coin === 'string' ? 'Crypto Asset' : (coin?.name || 'Crypto Asset');
                                        
                                        if (!symbol) return null;

                                        return (
                                            <button
                                                key={`${symbol}-${index}`}
                                                onClick={() => handleSelectResult(symbol)}
                                                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 rounded-2xl transition-all group/item overflow-hidden"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold shadow-sm group-hover/item:scale-110 transition-transform uppercase">
                                                    {symbol.charAt(0)}
                                                </div>
                                                <div className="flex flex-col items-start truncate text-left">
                                                    <span className="text-[13px] font-extrabold text-slate-800 leading-tight uppercase tracking-tight">{symbol}</span>
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[120px]">{name}</span>
                                                </div>
                                                <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <div className="bg-slate-100 px-2 py-1 rounded-md text-[10px] font-bold text-slate-400">JUMP →</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : !isSearching && (
                                <div className="px-6 py-10 text-center">
                                    <div className="text-slate-200 mb-2 flex justify-center"><Search size={32} strokeWidth={1.5} /></div>
                                    <p className="text-[13px] font-bold text-slate-400">未找到匹配的资产</p>
                                    <p className="text-[11px] text-slate-300 mt-1 uppercase tracking-tight">尝试输入不同的币种代码</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions / User Area */}
                <div className="flex items-center gap-4">
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-sm hover:bg-slate-200 transition-all shadow-inner"
                        >
                            {initial}
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-50">
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Account</p>
                                    <p className="text-[14px] font-bold text-slate-800 mt-1 truncate">{user.username}</p>
                                </div>
                                <div className="p-1.5">
                                    <Link
                                        to="/user-center"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center px-4 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        个人中心
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            onLogout && onLogout();
                                        }}
                                        className="w-full flex items-center px-4 py-2.5 text-[13px] font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        退出登录
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 极显黄色胶囊按钮 + 柔和外部发光 */
                    <div className="relative group">
                        {/* 按钮底层的黄色扩散阴影 */}
                        <div className="absolute inset-0 bg-yellow-300/40 rounded-full blur-xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        
                        <button
                            onClick={() => navigate('/login')}
                            className="relative flex items-center gap-2.5 bg-[#fef08a] hover:bg-[#fde047] text-slate-900 px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 shadow-[0_4px_12px_rgba(254,240,138,0.3)] hover:shadow-[0_8px_20px_rgba(254,240,138,0.5)] active:scale-95"
                        >
                            <span>登录账户</span>
                            <div className="w-5 h-5 bg-white/60 rounded-full flex items-center justify-center transition-colors group-hover:bg-white shadow-sm">
                                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    </header>
);
}
