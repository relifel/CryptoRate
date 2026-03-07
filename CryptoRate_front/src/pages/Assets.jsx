import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, Edit2 } from 'lucide-react';
import { assetAPI } from '../api';
import { getCryptoDisplay } from '../utils/cryptoHelper';
import { useOutletContext } from 'react-router-dom';

export default function Assets() {
    const { user, setShowLoginPage, setError } = useOutletContext();

    const [assetsList, setAssetsList] = useState([]);
    const [showAssetModal, setShowAssetModal] = useState(false);
    const [assetForm, setAssetForm] = useState({ symbol: '', amount: '', cost: '' });

    const loadAssets = async () => {
        if (!user) {
            setAssetsList([]);
            return;
        }
        try {
            const res = await assetAPI.getAssets();
            if (res && res.data) {
                setAssetsList(res.data);
            }
        } catch (err) {
            console.error('加载资产列表失败:', err);
        }
    };

    useEffect(() => {
        loadAssets();
    }, [user]);

    const refreshAssets = () => loadAssets();

    const handleSaveAsset = async () => {
        try {
            if (!assetForm.symbol || !assetForm.amount || !assetForm.cost) {
                setError('请填写完整资产信息');
                return;
            }
            await assetAPI.saveAsset({
                symbol: assetForm.symbol.trim().toUpperCase(),
                amount: parseFloat(assetForm.amount),
                cost: parseFloat(assetForm.cost)
            });
            setShowAssetModal(false);
            setAssetForm({ symbol: '', amount: '', cost: '' });
            refreshAssets();
        } catch (err) {
            console.error('保存资产失败:', err);
            setError('保存资产失败，请重试');
        }
    };

    const handleDeleteAsset = async (id, e) => {
        e.stopPropagation();
        try {
            if (window.confirm('确定要删除该条资产记录吗？')) {
                await assetAPI.deleteAsset(id);
                refreshAssets();
            }
        } catch (err) {
            console.error('删除资产失败:', err);
            setError('删除失败，请重试');
        }
    };

    const handleEditAsset = (asset, e) => {
        e.stopPropagation();
        setAssetForm({ symbol: asset.symbol, amount: asset.amount, cost: asset.cost });
        setShowAssetModal(true);
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 relative">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Wallet size={24} className="text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">个人资产管理</h2>
                    </div>
                    <button
                        onClick={() => {
                            if (!user) {
                                setShowLoginPage(true);
                                return;
                            }
                            setAssetForm({ symbol: '', amount: '', cost: '' });
                            setShowAssetModal(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus size={16} /> 添加资产
                    </button>
                </div>

                {!user ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                        <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-4">登录后可手动管理个人的加密货币资产与持仓成本</p>
                        <button
                            onClick={() => setShowLoginPage(true)}
                            className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
                        >去登录</button>
                    </div>
                ) : assetsList.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                        <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">当前没有录入任何资产</p>
                        <button
                            onClick={() => setShowAssetModal(true)}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                        >开始添加资产</button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">币种</th>
                                    <th className="px-6 py-4">持有数量</th>
                                    <th className="px-6 py-4">持仓总成本(USD)</th>
                                    <th className="px-6 py-4">均价成本</th>
                                    <th className="px-6 py-4 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assetsList.map((asset) => {
                                    const crypto = getCryptoDisplay(asset.symbol);
                                    const avgCost = asset.amount > 0 ? (asset.cost / asset.amount).toFixed(2) : '0.00';
                                    return (
                                        <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{crypto.icon}</span>
                                                    <span className="font-bold text-gray-900">{asset.symbol}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{asset.amount}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">${asset.cost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="px-6 py-4 text-gray-500">${avgCost}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => handleEditAsset(asset, e)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="编辑信息 (重新录入会覆盖原记录)"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteAsset(asset.id, e)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                        title="删除记录"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showAssetModal && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">编辑资产状况</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">币种代码 (例如: BTC, ETH)</label>
                                <input
                                    type="text"
                                    value={assetForm.symbol}
                                    onChange={(e) => setAssetForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="BTC"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">持有数量</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.0001"
                                    value={assetForm.amount}
                                    onChange={(e) => setAssetForm(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">持仓总成本 (USD)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={assetForm.cost}
                                    onChange={(e) => setAssetForm(prev => ({ ...prev, cost: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="投资的总金额 USD"
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowAssetModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSaveAsset}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                            >
                                保存记录
                            </button>
                        </div>
                        <p className="mt-3 text-xs text-gray-400 opacity-80">* 提示: 同一币种多次保存将直接覆盖最新数值。</p>
                    </div>
                </div>
            )}
        </div>
    );
}
