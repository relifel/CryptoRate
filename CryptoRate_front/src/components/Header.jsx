import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { clearAuth } from '../api';

export default function Header({ user, setUser, setShowLoginPage, favoritesCount }) {
    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold text-gray-900">CryptoRate</h1>
                    <nav className="flex gap-6">
                        {[
                            { path: '/', label: '市场' },
                            { path: '/favorites', label: '收藏', count: favoritesCount },
                            { path: '/assets', label: '资产' },
                            { path: '/analysis', label: '分析' },
                            ...(user ? [{ path: '/profile', label: '个人中心' }] : [])
                        ].map(tab => (
                            <NavLink
                                key={tab.path}
                                to={tab.path}
                                className={({ isActive }) => `text-sm font-medium pb-1 transition-colors flex items-center gap-1 ${isActive
                                    ? 'text-gray-900 border-b-2 border-gray-900'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="text-xs text-gray-400">({tab.count})</span>
                                )}
                            </NavLink>
                        ))}
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
                                    clearAuth();
                                    setUser(null);
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
    );
}
