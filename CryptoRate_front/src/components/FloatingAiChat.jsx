import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 全局悬浮助手 Floating AI Chat
 * 极简毛玻璃胶囊形态
 */
export default function FloatingAiChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef(null);
    const location = useLocation();

    // 智能隐藏逻辑：在 AI 专属分析页中直接不渲染
    if (location.pathname === '/analysis') {
        return null;
    }
    
    // Auto resize input
    const handleInput = (e) => {
        setInputValue(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            
            {/* Popover 面板 */}
            <div 
                className={`absolute bottom-20 right-0 w-[400px] mb-2 origin-bottom-right transition-all duration-300 ease-out ${
                    isOpen 
                    ? 'opacity-100 scale-100 translate-y-0 visible' 
                    : 'opacity-0 scale-95 translate-y-4 invisible pointer-events-none'
                }`}
            >
                {/* 胶囊面板主体 bg-white/95 backdrop-blur */}
                <div className="bg-white/95 backdrop-blur-xl border border-slate-100/60 shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-[2rem] overflow-hidden flex flex-col h-[500px]">
                    
                    {/* 顶部极简问候头 Header */}
                    <div className="px-6 py-5 border-b border-slate-50/50 shrink-0 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-800">
                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                            </svg>
                            <span className="text-[15px] font-bold tracking-tight text-slate-800">CryptoRate AI</span>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    {/* 聊天记录空白区 Message Area */}
                    <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                        <div className="flex flex-col gap-6">
                            {/* AI Initial greeting message */}
                            <div className="flex justify-start">
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-3.5 max-w-[85%]">
                                    <p className="text-[14.5px] text-slate-700 leading-relaxed font-medium">✨ 你好，有什么加密资产数据或趋势我可以帮您解答？</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 底部输入区 Bottom Input Area */}
                    <div className="p-4 shrink-0 bg-white">
                        {/* 缩小版极简输入框 */}
                        <div 
                            className={`relative rounded-3xl bg-slate-50/50 border transition-all duration-200 flex items-end ${
                                isFocused 
                                ? 'border-slate-300 shadow-sm bg-white' 
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInput}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="输入您的问题..."
                                className="w-full bg-transparent outline-none resize-none py-3.5 pl-5 pr-12 text-slate-800 text-[15px] placeholder:text-slate-400 font-medium"
                                style={{ height: '50px', maxHeight: '100px' }}
                            />
                            
                            <button 
                                className={`absolute right-2.5 bottom-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    inputValue.trim().length > 0
                                    ? 'bg-slate-900 text-white shadow-sm hover:scale-105 active:scale-95'
                                    : 'bg-transparent text-slate-300 cursor-not-allowed'
                                }`}
                                disabled={inputValue.trim().length === 0}
                                onClick={() => {
                                    if (inputValue.trim()) {
                                        setInputValue('');
                                        if (textareaRef.current) textareaRef.current.style.height = '50px';
                                    }
                                }}
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19V5M5 12l7-7 7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* 悬浮唤醒按钮 FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50 backdrop-blur-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-100 ${
                    isOpen ? 'bg-slate-100 text-slate-800 scale-90' : 'bg-slate-900 text-white hover:scale-105 hover:-translate-y-1'
                }`}
            >
                {isOpen ? (
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="animate-in spin-in-90 duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="animate-in spin-out-90 duration-300">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                    </svg>
                )}
            </button>

        </div>
    );
}
