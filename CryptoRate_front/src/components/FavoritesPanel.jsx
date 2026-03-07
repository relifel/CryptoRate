import React, { useState, useEffect } from 'react';
import { Star, Bell, Trash2, Edit2, ArrowUp, ArrowDown, Loader2, ListFilter } from 'lucide-react';
import { favoriteAPI } from '../api';

/**
 * 极简风收藏面板组件
 * 
 * 功能：列表展示、涨跌排序、自定义备注、价格提醒、批量删除
 */
const FavoritesPanel = ({ favorites, latestRates, getCryptoDisplay, onRefresh, setActiveTab, setSelectedCrypto }) => {
    // 状态
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal 状态
    const [noteModal, setNoteModal] = useState({ show: false, symbol: '', note: '' });
    const [alertModal, setAlertModal] = useState({ show: false, symbol: '', upper: '', lower: '' });

    // Toast 通知
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
    const showToast = (msg, type = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    // --- 批量删除逻辑 ---
    const toggleSelect = (symbol) => {
        setSelectedIds(prev => prev.includes(symbol) ? prev.filter(id => id !== symbol) : [...prev, symbol]);
    };

    const handleBatchDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`确定要移除选中的 ${selectedIds.length} 个币种吗？`)) return;

        setActionLoading(true);
        try {
            await favoriteAPI.batchRemove(selectedIds);
            showToast('已批量移除收藏');
            setIsSelectionMode(false);
            setSelectedIds([]);
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast('移除失败，请重试', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // --- 单个操作 ---
    const handleRemove = async (symbol) => {
        try {
            await favoriteAPI.remove(symbol);
            showToast(`已移除 ${symbol}`);
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast('移除失败', 'error');
        }
    };

    const handleSaveNote = async () => {
        setActionLoading(true);
        try {
            await favoriteAPI.updateNote(noteModal.symbol, noteModal.note);
            showToast('备注已保存');
            setNoteModal({ show: false, symbol: '', note: '' });
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast('保存备注失败', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveAlert = async () => {
        setActionLoading(true);
        try {
            const upper = alertModal.upper ? parseFloat(alertModal.upper) : null;
            const lower = alertModal.lower ? parseFloat(alertModal.lower) : null;
            await favoriteAPI.updateAlert(alertModal.symbol, upper, lower);
            showToast('提醒已设置');
            setAlertModal({ show: false, symbol: '', upper: '', lower: '' });
            if (onRefresh) onRefresh();
        } catch (err) {
            showToast('设置提醒失败', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // --- 排序逻辑 (简单冒泡上移下移持久化) ---
    const moveItem = async (index, direction) => {
        if (index === 0 && direction === -1) return;
        if (index === favorites.length - 1 && direction === 1) return;

        // 本地乐观更新
        const newArray = [...favorites];
        const temp = newArray[index];
        newArray[index] = newArray[index + direction];
        newArray[index + direction] = temp;

        // 构建排序请求参数
        const sortList = newArray.map((item, idx) => ({
            symbol: typeof item === 'string' ? item : item.symbol,
            sortOrder: idx
        }));

        try {
            await favoriteAPI.updateSort(sortList);
            if (onRefresh) onRefresh(); // 触发全量刷新以防并发问题
        } catch (err) {
            showToast('排序保存失败', 'error');
        }
    };

    // 空状态展示
    if (!favorites || favorites.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 h-full">
                <Star size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无收藏内容</h3>
                <p className="text-gray-500 mb-6 text-sm">在市场页面点击星号图标即可添加关注的币种</p>
                <button
                    onClick={() => setActiveTab('market')}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    去市场看看
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8 relative h-full">
            {/* 全局简易 Toast */}
            {toast.show && (
                <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium shadow-lg z-50 transition-all ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Star size={24} className="text-gray-900" fill="currentColor" />
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">我的收藏</h2>
                        <span className="text-sm font-medium px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                            {favorites.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {isSelectionMode ? (
                            <>
                                <button
                                    onClick={() => setSelectedIds(favorites.map(f => typeof f === 'string' ? f : f.symbol))}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    全选
                                </button>
                                <button
                                    onClick={handleBatchDelete}
                                    disabled={selectedIds.length === 0 || actionLoading}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> 删除选中
                                </button>
                                <button
                                    onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }}
                                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-white transition-colors"
                                >
                                    取消
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsSelectionMode(true)}
                                className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <ListFilter size={16} /> 批量操作
                            </button>
                        )}
                    </div>
                </div>

                {/* 列表区域 */}
                <div className="space-y-3">
                    {favorites.map((favItem, index) => {
                        // 兼容新旧数据结构（直接的字符串 vs 对象）
                        const fav = typeof favItem === 'string' ? { symbol: favItem } : favItem;
                        if (!fav || !fav.symbol) return null;

                        const crypto = getCryptoDisplay(fav.symbol);
                        const rate = latestRates[fav.symbol] || { price: 0 };
                        // Mock 涨跌幅用于展示，如果有真实数据请替换
                        const change = (Math.random() - 0.5) * 5;
                        const isPositive = change >= 0;

                        return (
                            <div key={fav.symbol} className="group flex items-center bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer" onClick={() => { if (!isSelectionMode) { setSelectedCrypto(fav.symbol); setActiveTab('market'); } }}>
                                {/* 批量选择模式 Checkbox */}
                                {isSelectionMode && (
                                    <div className="pr-4 pl-2" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(fav.symbol)}
                                            onChange={() => toggleSelect(fav.symbol)}
                                            className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                                        />
                                    </div>
                                )}

                                {/* 左侧：图标与名称 */}
                                <div className="flex items-center gap-4 w-64">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-xl">
                                        {crypto.icon}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-base flex items-center gap-2">
                                            {fav.symbol}
                                            {fav.note && (
                                                <span title={fav.note} className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">{crypto.name}</div>
                                    </div>
                                </div>

                                {/* 中间：行情数据 */}
                                <div className="flex-1 flex items-center justify-between px-8 border-l border-r border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500 mb-0.5">当前价格</span>
                                        <span className="text-lg font-bold text-gray-900 font-mono">
                                            ${typeof rate === 'number' ? rate.toLocaleString('en-US', { minimumFractionDigits: 2 }) : (rate.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex flex-col content-end text-right">
                                        <span className="text-sm text-gray-500 mb-0.5">24h涨跌</span>
                                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-md inline-block w-fit ml-auto ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>

                                {/* 右侧：附加信息 & 操作 */}
                                <div className="flex items-center gap-6 pl-8 min-w-[300px] justify-end">
                                    {/* 提醒阈值 Badge */}
                                    <div className="flex flex-col gap-1 hidden sm:flex">
                                        {fav.priceUpper && (
                                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                                                <ArrowUp size={12} className="text-green-600" /> ${fav.priceUpper}
                                            </span>
                                        )}
                                        {fav.priceLower && (
                                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                                                <ArrowDown size={12} className="text-red-600" /> ${fav.priceLower}
                                            </span>
                                        )}
                                    </div>

                                    {!isSelectionMode && (
                                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => moveItem(index, -1)} disabled={index === 0} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors" title="上移"><ArrowUp size={16} /></button>
                                            <button onClick={() => moveItem(index, 1)} disabled={index === favorites.length - 1} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors" title="下移"><ArrowDown size={16} /></button>

                                            <div className="h-4 w-px bg-gray-200 mx-1"></div>

                                            <button onClick={() => setNoteModal({ show: true, symbol: fav.symbol, note: fav.note || '' })} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑备注"><Edit2 size={16} /></button>
                                            <button onClick={() => setAlertModal({ show: true, symbol: fav.symbol, upper: fav.priceUpper || '', lower: fav.priceLower || '' })} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="价格提醒"><Bell size={16} /></button>
                                            <button onClick={() => { if (window.confirm(`确认取消收藏 ${fav.symbol} 吗？`)) handleRemove(fav.symbol); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="取消收藏"><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 备注 Modal */}
            {noteModal.show && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Edit2 size={20} className="text-blue-600" /> 备注 ({noteModal.symbol})</h3>
                        <textarea
                            value={noteModal.note}
                            onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm placeholder:text-gray-400"
                            rows={4}
                            placeholder="例如：等回调到 65000 考虑加仓..."
                            maxLength={200}
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setNoteModal({ show: false, symbol: '', note: '' })} className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
                            <button onClick={handleSaveNote} disabled={actionLoading} className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-70 transition-colors flex items-center gap-2">
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : '保存'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 价格提醒 Modal */}
            {alertModal.show && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Bell size={20} className="text-purple-600" /> 价格提醒 ({alertModal.symbol})</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">上限提醒价 (USD)</label>
                                <input
                                    type="number"
                                    value={alertModal.upper}
                                    onChange={(e) => setAlertModal({ ...alertModal, upper: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                                    placeholder="比如: 70000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">下限提醒价 (USD)</label>
                                <input
                                    type="number"
                                    value={alertModal.lower}
                                    onChange={(e) => setAlertModal({ ...alertModal, lower: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
                                    placeholder="比如: 50000"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end gap-3">
                            <button onClick={() => setAlertModal({ show: false, symbol: '', upper: '', lower: '' })} className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">取消</button>
                            <button onClick={handleSaveAlert} disabled={actionLoading} className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-70 transition-colors flex items-center gap-2">
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : '确定'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FavoritesPanel;
