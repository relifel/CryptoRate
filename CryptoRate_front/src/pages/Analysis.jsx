import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { analysisAPI } from '../api';
import '../home.css';

export default function Analysis() {
    const context = useOutletContext() || {};
    const { user, setShowLoginPage, favorites } = context;

    const [selectedCoin, setSelectedCoin] = useState('BTC');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState('');

    const runAnalysis = async () => {
        if (!user) {
            setShowLoginPage(true);
            return;
        }
        setIsAnalyzing(true);
        setReport('');
        try {
            const res = await analysisAPI.getExplanation(selectedCoin);
            if (res && res.data) {
                setReport(res.data);
            } else {
                setReport("AI 引擎未返回结果，请稍后再试。");
            }
        } catch (err) {
            setReport(`AI 分析失败: ${err.message || '网络连接中断'}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="home-container overflow-y-auto w-full h-full relative">
            <div className="app-container pb-24">
                {/* Global Navbar is absolute positioned above this, so we just add a spacer */}
                <div className="h-28"></div>

                <main className="mt-8 flex gap-8 h-[calc(100vh-140px)]">
                    {/* 左侧控制栏 */}
                    <div className="w-[320px] bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
                        <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-6">CryptoRate AI 研报</h2>

                        <div className="mb-6 flex-1">
                            <label className="block text-sm font-semibold text-slate-600 mb-3">选择想分析的标的</label>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setSelectedCoin('BTC')}
                                    className={`px-4 py-3 rounded-xl text-left font-semibold transition-all ${selectedCoin === 'BTC' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    Bitcoin (BTC)
                                </button>
                                <button
                                    onClick={() => setSelectedCoin('ETH')}
                                    className={`px-4 py-3 rounded-xl text-left font-semibold transition-all ${selectedCoin === 'ETH' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    Ethereum (ETH)
                                </button>
                                <button
                                    onClick={() => setSelectedCoin('SOL')}
                                    className={`px-4 py-3 rounded-xl text-left font-semibold transition-all ${selectedCoin === 'SOL' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    Solana (SOL)
                                </button>

                                {/* 渲染动态收藏里面的内容，过滤掉BTC/ETH/SOL防止重复 */}
                                {favorites?.filter(f => {
                                    const s = typeof f === 'string' ? f : f.symbol;
                                    return !['BTC', 'ETH', 'SOL'].includes(s);
                                }).map(fav => {
                                    const sym = typeof fav === 'string' ? fav : fav.symbol;
                                    return (
                                        <button
                                            key={sym}
                                            onClick={() => setSelectedCoin(sym)}
                                            className={`px-4 py-3 rounded-xl text-left font-semibold transition-all flex justify-between items-center ${selectedCoin === sym ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {sym}
                                            <svg className="w-4 h-4 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            disabled={isAnalyzing}
                            onClick={runAnalysis}
                            className="bg-[#fef08a] w-full py-4 rounded-full font-bold text-slate-900 hover:bg-[#fde047] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                    <span>AI 引擎计算中...</span>
                                </>
                            ) : (
                                <span>🚀 一键生成 {selectedCoin} 研报</span>
                            )}
                        </button>
                    </div>

                    {/* 右侧研报展示区 */}
                    <div className="flex-1 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-y-auto">
                        {!report && !isAnalyzing ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50 select-none">
                                <svg className="w-20 h-20 text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                                </svg>
                                <p className="text-slate-500 font-medium font-sans">选择币种并点击左侧按钮，获取 DeepMind 驱动的专属大盘分析</p>
                            </div>
                        ) : isAnalyzing ? (
                            <div className="h-full flex flex-col items-center justify-center">
                                <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-600 font-medium">分析 {selectedCoin} 链上数据及情绪指标中...</p>
                            </div>
                        ) : (
                            <div className="prose prose-slate max-w-none w-full">
                                {/* 简单的 Markdown 模拟渲染 */}
                                {report.split('\n').map((line, i) => {
                                    if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-2">{line.replace('### ', '')}</h3>;
                                    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2">{line.replace('## ', '')}</h2>;
                                    if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-black text-slate-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-400">{line.replace('# ', '')}</h1>;
                                    if (line.startsWith('- ')) return <li key={i} className="ml-4 text-slate-700 my-1">{line.replace('- ', '')}</li>;
                                    if (line.trim() === '') return <br key={i} />;
                                    return <p key={i} className="text-slate-700 leading-relaxed my-2">{line}</p>;
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
