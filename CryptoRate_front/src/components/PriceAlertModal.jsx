import React, { useState, useEffect } from 'react';

/**
 * 价格预警设置模态框
 * 
 * 符合“记录加密资产”风格：
 * - bg-slate-900/40 backdrop-blur-sm (玻璃遮罩)
 * - rounded-[24px] (大圆角)
 * - 渐变标题设计
 */
export default function PriceAlertModal({ isOpen, symbol, initialUpper, initialLower, onSave, onClose, isSaving }) {
    const [priceUpper, setPriceUpper] = useState('');
    const [priceLower, setPriceLower] = useState('');

    // 当打开模态框时，回显当前预设值
    useEffect(() => {
        if (isOpen) {
            setPriceUpper(initialUpper || '');
            setPriceLower(initialLower || '');
        }
    }, [isOpen, initialUpper, initialLower]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // 转换数值，空字符串转为 null
        const upper = priceUpper && priceUpper.trim() !== '' ? parseFloat(priceUpper) : null;
        const lower = priceLower && priceLower.trim() !== '' ? parseFloat(priceLower) : null;
        onSave(upper, lower);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
            <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl transform transition-all scale-100 origin-center animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-7">
                    <div className="flex flex-col">
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500">
                            设置价格预警
                        </h3>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {symbol} / USDT MONITORING
                        </span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* 上限：阻力位 */}
                    <div>
                        <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 mb-2.5 uppercase tracking-tight">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                            阻力抛售预警价 (Resistance / Upper)
                        </label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold font-mono">$</span>
                            <input
                                type="number"
                                step="any"
                                placeholder="未设置上限"
                                className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-900/5 outline-none transition-all font-mono font-bold text-slate-800"
                                value={priceUpper}
                                onChange={(e) => setPriceUpper(e.target.value)}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 ml-1">当价格【高于】此数值时触发提醒</p>
                    </div>

                    {/* 下限：支撑位 */}
                    <div>
                        <label className="flex items-center gap-2 text-[12px] font-bold text-slate-500 mb-2.5 uppercase tracking-tight">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            支撑抄底预警价 (Support / Lower)
                        </label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold font-mono">$</span>
                            <input
                                type="number"
                                step="any"
                                placeholder="未设置下限"
                                className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-900/5 outline-none transition-all font-mono font-bold text-slate-800"
                                value={priceLower}
                                onChange={(e) => setPriceLower(e.target.value)}
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 ml-1">当价格【低于】此数值时触发提醒</p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center gap-2 text-sm"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    正在同步云端...
                                </>
                            ) : '保存预警设置'}
                        </button>
                    </div>
                </form>

                {/* Footer Tip */}
                <p className="text-center text-[11px] text-slate-300 mt-6 flex items-center justify-center gap-1.5">
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Tip: 设置为空即代表取消该价位的预警
                </p>
            </div>
        </div>
    );
}
