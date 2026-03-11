import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { favoriteAPI } from '../api';
import '../home.css';

export default function Favorites() {
    const context = useOutletContext() || {};
    const { user, setShowLoginPage, favorites, loadFavorites, latestRates, toggleFavorite } = context;

    const [editingNoteId, setEditingNoteId] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    useEffect(() => {
        if (user) {
            loadFavorites();
        }
    }, [user, loadFavorites]);

    const handleSaveNote = async (symbol) => {
        setIsSavingNote(true);
        try {
            await favoriteAPI.updateNote(symbol, noteText);
            setEditingNoteId(null);
            loadFavorites();
        } catch (err) {
            alert('更新备注失败');
        } finally {
            setIsSavingNote(false);
        }
    };

    return (
        <div className="home-container overflow-y-auto w-full min-h-screen relative">
            {/* 修复：统一使用 w-full max-w-[1400px] mx-auto px-6 实现大气且居中的布局 */}
            <div className="w-full max-w-[1400px] mx-auto px-6 pt-24 pb-12">

                <main>
                    <section className="toolbar mt-8">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">收藏监控池</h2>
                        <div className="text-sm font-medium text-slate-500">
                            已收藏 {favorites?.length || 0} 个区块资产
                        </div>
                    </section>

                    <section className="table-container mt-8 shadow-sm">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}></th>
                                    <th>资产 (Asset)</th>
                                    <th className="text-right">当前汇率 (Price)</th>
                                    <th className="text-right">预警区间 (Alert)</th>
                                    <th>投资笔记 (Note)</th>
                                    <th className="text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!user ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20 text-slate-500 font-medium">
                                            请先登录查看我关注的加密资产
                                        </td>
                                    </tr>
                                ) : (!favorites || favorites.length === 0) ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-20 text-slate-500 font-medium">
                                            监控池空空如也，去大盘添加点关注吧
                                        </td>
                                    </tr>
                                ) : (
                                    favorites.map((fav) => {
                                        // Handle backward compatibility (string vs object)
                                        const symbol = typeof fav === 'string' ? fav : fav.symbol;
                                        const note = typeof fav === 'string' ? '' : fav.note;
                                        const pUpper = typeof fav === 'string' ? null : fav.priceUpperAlert;
                                        const pLower = typeof fav === 'string' ? null : fav.priceLowerAlert;

                                        const rate = latestRates && latestRates[symbol] ? latestRates[symbol] : 0;
                                        const isEditing = editingNoteId === symbol;

                                        return (
                                            <tr key={symbol}>
                                                <td>
                                                    <button
                                                        className="watch-toggle active"
                                                        onClick={() => toggleFavorite(symbol)}
                                                        title="取消收藏"
                                                    >
                                                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                                                        </svg>
                                                    </button>
                                                </td>
                                                <td className="font-bold text-slate-800 text-[16px]">{symbol}</td>
                                                <td className="text-right font-medium text-slate-900">${rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                                                <td className="text-right text-slate-500 text-sm">
                                                    {pUpper || pLower ? (
                                                        <div className="flex flex-col items-end gap-1">
                                                            {pUpper && <span className="text-red-500">↑ ${pUpper}</span>}
                                                            {pLower && <span className="text-green-500">↓ ${pLower}</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="opacity-50">未设置</span>
                                                    )}
                                                </td>
                                                <td className="w-[30%]">
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={noteText}
                                                                onChange={(e) => setNoteText(e.target.value)}
                                                                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:border-slate-500 focus:outline-none"
                                                                placeholder="添加买入理由或预备操作..."
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleSaveNote(symbol)}
                                                                disabled={isSavingNote}
                                                                className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded hover:bg-slate-700 whitespace-nowrap"
                                                            >
                                                                {isSavingNote ? '...' : '保存'}
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingNoteId(null)}
                                                                className="text-xs text-slate-500 hover:text-slate-800"
                                                            >
                                                                取消
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                                                            setNoteText(note || '');
                                                            setEditingNoteId(symbol);
                                                        }}>
                                                            <span className={`text-sm ${note ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                                                {note || '双击或点击编辑笔记...'}
                                                            </span>
                                                            <svg className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
                                                        onClick={() => {
                                                            const up = prompt(`为 ${symbol} 设置阻力抛售预警价位 (USD)：`, pUpper || '');
                                                            if (up === null) return;
                                                            const down = prompt(`为 ${symbol} 设置底部抄底预警价位 (USD)：`, pLower || '');
                                                            if (down === null) return;
                                                            favoriteAPI.updateAlert(symbol, up ? parseFloat(up) : null, down ? parseFloat(down) : null).then(() => loadFavorites());
                                                        }}
                                                    >
                                                        设置价格预警
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>
        </div>
    );
}
