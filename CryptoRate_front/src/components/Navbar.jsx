import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
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

            {/* Navigation Links - 居中对齐 */}
            <nav className="flex items-center gap-10">
                <Link 
                    to="/" 
                    className={`text-[13px] font-bold transition-all ${isActive('/') ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    大盘行情
                </Link>
                <Link 
                    to="/assets" 
                    className={`text-[13px] font-bold transition-all ${isActive('/assets') ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    我的资产
                </Link>
                <Link 
                    to="/favorites" 
                    className={`text-[13px] font-bold transition-all ${isActive('/favorites') ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    我的收藏
                </Link>
                <Link 
                    to="/analysis" 
                    className={`flex items-center gap-2 text-[13px] font-bold transition-all ${isActive('/analysis') ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    AI 智能分析
                    {/* 特色：AI 动态脉冲点 */}
                    <div className="relative flex items-center justify-center w-2 h-2">
                        <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-60"></div>
                        <div className="relative w-1.5 h-1.5 bg-teal-500 rounded-full shadow-[0_0_5px_rgba(20,184,166,0.6)]"></div>
                    </div>
                </Link>
            </nav>

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
                            <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
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
        </header>
    );
}
