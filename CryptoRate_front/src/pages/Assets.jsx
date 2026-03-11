import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { assetAPI } from '../api';
import '../home.css';

export default function Assets() {
    const context = useOutletContext() || {};
    const { user, setShowLoginPage, latestRates, error, setError } = context;

    const [assets, setAssets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 模态框状态
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ symbol: '', amount: '', cost: '' });
    const [isSaving, setIsSaving] = useState(false);

    // 获取资产列表
    const fetchAssets = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await assetAPI.getAssets();
            if (res && res.data) {
                setAssets(res.data);
            }
        } catch (err) {
            console.error('获取资产失败:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAssets();
        } else {
            setAssets([]);
        }
    }, [user]);

    // 计算总资产
    let totalValue = 0;
    let totalCost = 0;

    const processedAssets = assets.map(asset => {
        const rate = latestRates && latestRates[asset.symbol] ? latestRates[asset.symbol] : 0;
        const currentValue = rate * asset.amount;
        const profit = currentValue - asset.cost;
        const roi = asset.cost > 0 ? (profit / asset.cost) * 100 : 0;

        totalValue += currentValue;
        totalCost += asset.cost;

        return {
            ...asset,
            currentValue,
            profit,
            roi,
            currentPrice: rate
        };
    });

    const totalProfit = totalValue - totalCost;
    const totalRoi = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                symbol: formData.symbol.toUpperCase().trim(),
                amount: parseFloat(formData.amount),
                cost: parseFloat(formData.cost)
            };
            await assetAPI.saveAsset(payload);
            setIsModalOpen(false);
            setFormData({ symbol: '', amount: '', cost: '' });
            fetchAssets(); // 重新加载
        } catch (err) {
            alert('保存失败，请检查填写内容');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('确定要删除这条资产记录吗？')) return;
        try {
            await assetAPI.deleteAsset(id);
            fetchAssets();
        } catch (err) {
            alert('删除失败');
        }
    };

    return (
        <div className="home-container overflow-y-auto w-full min-h-screen relative">
            {/* 修复：统一使用 w-full max-w-[1400px] mx-auto px-6 实现大气且居中的布局 */}
            <div className="w-full max-w-[1400px] mx-auto px-6 pt-24 pb-12">
                <main>
                    <section className="market-overview mb-12">
                        <div className="stat-block">
                            <div className="stat-label">总资产估值 (USD)</div>
                            <div className="stat-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className={`stat-change ${totalProfit >= 0 ? 'trend-up' : 'trend-down'}`}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {totalProfit >= 0
                                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"></path>
                                    }
                                </svg>
                                {Math.abs(totalRoi).toFixed(2)}% <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>总收益: ${totalProfit.toFixed(2)}</span>
                            </div>
                        </div>
                    </section>

                    <section className="toolbar">
                        <h2 className="text-xl font-bold">资产列表</h2>
                        <button
                            onClick={() => {
                                if (!user) return setShowLoginPage(true);
                                setIsModalOpen(true);
                            }}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                            + 记录新资产
                        </button>
                    </section>

                    <section className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>币种 (Asset)</th>
                                    <th className="text-right">持有数量 (Amount)</th>
                                    <th className="text-right">当前单价 (Price)</th>
                                    <th className="text-right">总成本 (Cost)</th>
                                    <th className="text-right">当前估值 (Value)</th>
                                    <th className="text-right">未实现盈亏 (PNL)</th>
                                    <th className="text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!user ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-20 text-slate-500 font-medium tracking-wide">
                                            请先登录查看资产详情
                                        </td>
                                    </tr>
                                ) : isLoading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-20">
                                            <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-slate-800 animate-spin mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : processedAssets.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-20 text-slate-500 font-medium">
                                            暂无资产记录，点击右上角添加
                                        </td>
                                    </tr>
                                ) : (
                                    processedAssets.map((asset) => (
                                        <tr key={asset.id}>
                                            <td className="font-semibold text-slate-900">{asset.symbol}</td>
                                            <td className="text-right font-medium">{asset.amount.toLocaleString()}</td>
                                            <td className="text-right">${asset.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                                            <td className="text-right text-slate-600">${asset.cost.toLocaleString()}</td>
                                            <td className="text-right font-bold text-slate-900">${asset.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className={`text-right font-medium ${asset.profit >= 0 ? 'trend-up' : 'trend-down'}`}>
                                                {asset.profit >= 0 ? '+' : ''}{asset.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br />
                                                <span className="text-xs opacity-80">{asset.roi >= 0 ? '+' : ''}{asset.roi.toFixed(2)}%</span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    onClick={() => handleDelete(asset.id)}
                                                    className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                                                >
                                                    删除
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </section>
                </main>
            </div>

            {/* 添加资产 Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500">记录加密资产</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">代币名称 (Symbol)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="例如: BTC"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 focus:bg-white outline-none transition-all uppercase"
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">持有数量 (Amount)</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 focus:bg-white outline-none transition-all"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">持仓总成本 (Total Cost in USD)</label>
                                <input
                                    type="number"
                                    step="any"
                                    required
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 focus:bg-white outline-none transition-all"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl mt-6 hover:bg-slate-800 transition-colors flex justify-center items-center disabled:opacity-70"
                            >
                                {isSaving ? '保存中...' : '保存资产记录'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
