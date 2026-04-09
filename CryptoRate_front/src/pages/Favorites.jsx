import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { favoriteAPI } from '../api';
import NoteEditorModal from '../components/NoteEditorModal';
import PriceAlertModal from '../components/PriceAlertModal';
import '../home.css';

export default function Favorites() {
    const context = useOutletContext() || {};
    const { user, setShowLoginPage, favorites, loadFavorites, latestRates, toggleFavorite } = context;

    // 1. 备注弹窗状态
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [currentSymbol, setCurrentSymbol] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

    // 2. 价格预警弹窗状态 (New)
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertSymbol, setAlertSymbol] = useState(null);
    const [alertUpper, setAlertUpper] = useState(null);
    const [alertLower, setAlertLower] = useState(null);
    const [isSavingAlert, setIsSavingAlert] = useState(false);

    useEffect(() => {
        if (user) {
            loadFavorites();
        }
    }, [user, loadFavorites]);

    // 打开备注编辑器
    const openNoteEditor = (symbol, currentNote) => {
        setCurrentSymbol(symbol);
        setNoteText(currentNote || '');
        setIsNoteModalOpen(true);
    };

    // 保存备注
    const handleSaveNote = async (newNote) => {
        setIsSavingNote(true);
        try {
            await favoriteAPI.updateNote(currentSymbol, newNote);
            setIsNoteModalOpen(false);
            loadFavorites();
        } catch (err) {
            console.error('更新备注失败:', err);
            alert(err.message || '更新备注失败，请检查网络');
        } finally {
            setIsSavingNote(false);
        }
    };

    // 打开价格预警编辑器 (New)
    const openPriceAlert = (symbol, pUpper, pLower) => {
        setAlertSymbol(symbol);
        setAlertUpper(pUpper);
        setAlertLower(pLower);
        setIsAlertModalOpen(true);
    };

    // 保存价格预警 (New - Fixes Logout Bug)
    const handleSaveAlert = async (upper, lower) => {
        setIsSavingAlert(true);
        try {
            // 使用自定义 API 调用，确保数据格式正确
            await favoriteAPI.updateAlert(alertSymbol, upper, lower);
            setIsAlertModalOpen(false);
            loadFavorites(); // 刷新列表
        } catch (err) {
            console.error('更新预警失败:', err);
            // 显示具体错误原因
            alert(err.message || '更新预警失败');
        } finally {
            setIsSavingAlert(false);
        }
    };

    return (
        <div className="home-container overflow-y-auto w-full min-h-screen relative">
            <div className="w-full max-w-[1400px] mx-auto px-6 pt-24 pb-12">

                <main>
                    <section className="toolbar mt-8">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">收藏监控池</h2>
                        <div className="text-sm font-medium text-slate-500">
                            已收藏 {favorites?.length || 0} 个区块资产
                        </div>
                    </section>

                    <section className="table-container mt-8 shadow-sm">
                        <table className="w-full">
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
                                        const symbol = typeof fav === 'string' ? fav : fav.symbol;
                                        const note = typeof fav === 'string' ? '' : fav.note;
                                        const pUpper = typeof fav === 'string' ? null : fav.priceUpper;
                                        const pLower = typeof fav === 'string' ? null : fav.priceLower;

                                        const rate = latestRates && latestRates[symbol] ? latestRates[symbol] : 0;

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
                                                            {pUpper && <span className="text-rose-500 font-mono font-bold">↑ ${parseFloat(pUpper).toLocaleString()}</span>}
                                                            {pLower && <span className="text-emerald-500 font-mono font-bold">↓ ${parseFloat(pLower).toLocaleString()}</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="opacity-30 italic">未设置</span>
                                                    )}
                                                </td>
                                                <td className="w-[30%]">
                                                    <div 
                                                        className="flex items-center gap-2 group cursor-pointer" 
                                                        onClick={() => openNoteEditor(symbol, note)}
                                                    >
                                                        <span className={`text-sm leading-relaxed ${note ? 'text-slate-600' : 'text-slate-400 italic'}`}>
                                                            {note 
                                                                ? (note.length > 30 ? note.substring(0, 30) + '...' : note) 
                                                                : '点此写下追踪逻辑...'}
                                                        </span>
                                                        <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                                                        </svg>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <button
                                                        className="bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white px-4 py-2 rounded-xl text-[12px] font-bold transition-all duration-300 shadow-sm border border-slate-100"
                                                        onClick={() => openPriceAlert(symbol, pUpper, pLower)}
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

            {/* 备注弹窗 */}
            <NoteEditorModal 
                isOpen={isNoteModalOpen}
                symbol={currentSymbol}
                initialNote={noteText}
                onSave={handleSaveNote}
                onClose={() => setIsNoteModalOpen(false)}
                isSaving={isSavingNote}
            />

            {/* 价格预警弹窗 (New UI) */}
            <PriceAlertModal 
                isOpen={isAlertModalOpen}
                symbol={alertSymbol}
                initialUpper={alertUpper}
                initialLower={alertLower}
                onSave={handleSaveAlert}
                onClose={() => setIsAlertModalOpen(false)}
                isSaving={isSavingAlert}
            />
        </div>
    );
}
