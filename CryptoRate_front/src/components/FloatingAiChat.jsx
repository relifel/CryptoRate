import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { aiAPI } from '../api';

/**
 * 全局悬浮助手 Floating AI Chat
 * 极简毛玻璃胶囊形态
 */
export default function FloatingAiChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [messages, setMessages] = useState([]); // 新增：保存聊天记录
    const [isLoading, setIsLoading] = useState(false); // 新增：回答加载状态
    const textareaRef = useRef(null);
    const scrollRef = useRef(null);
    const location = useLocation();

    // 自动滚动到最新消息（必须在所有条件判断之前调用 Hook）
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    
    // 输入框自适应高度
    const handleInput = (e) => {
        setInputValue(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
        }
    };

    // 真实发送消息逻辑
    const handleSend = async () => {
        const question = inputValue.trim();
        if (!question || isLoading) return;

        const userMsg = { id: Date.now(), text: question, sender: 'user' };
        // 占位
        const aiMsgId = Date.now() + 1;
        const aiMsg = { id: aiMsgId, text: "", sender: 'ai' };
        
        setMessages(prev => [...prev, userMsg, aiMsg]);
        setInputValue('');
        setIsLoading(true);

        if (textareaRef.current) textareaRef.current.style.height = '50px';

        aiAPI.chatStream(
            question,
            (chunkText) => {
                setIsLoading(false);
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMsgId ? { ...msg, text: msg.text + chunkText } : msg
                ));
            },
            (err) => {
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMsgId ? { ...msg, text: `连接服务失败: ${err.message}` } : msg
                ));
                setIsLoading(false);
            },
            () => {
                setIsLoading(false);
            }
        );
    };

    // 智能隐藏逻辑：在 AI 分析页面隐藏悬浮助手（必须放在所有 Hooks 之后）
    if (location.pathname === '/analysis') {
        return null;
    }

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
                {/* 胶囊面板主体 */}
                <div className="bg-white/95 backdrop-blur-xl border border-slate-100/60 shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-[2rem] overflow-hidden flex flex-col h-[520px]">
                    
                    {/* Header */}
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

                    {/* Message Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 scroll-smooth bg-slate-50/30">
                        <div className="flex flex-col gap-5">
                            {/* 默认欢迎语 */}
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-3.5 max-w-[85%] shadow-sm">
                                    <p className="text-[14px] text-slate-700 leading-relaxed font-medium">✨ 你好，我是 CryptoRate 智库助手。有什么我可以帮您的？</p>
                                </div>
                            </div>
                            
                            {/* 渲染历史消息 */}
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`px-5 py-3.5 rounded-2xl max-w-[85%] text-[14px] leading-relaxed shadow-sm ${
                                        msg.sender === 'user' 
                                        ? 'bg-slate-900 text-white rounded-br-sm' 
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {/* 回答加载动效 */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 底部输入区 */}
                    <div className="p-4 shrink-0 bg-white border-t border-slate-50">
                        <div 
                            className={`relative rounded-3xl bg-slate-50 border transition-all duration-200 flex items-end ${
                                isFocused 
                                ? 'border-slate-300 shadow-sm bg-white' 
                                : 'border-slate-100 hover:border-slate-200'
                            }`}
                        >
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={handleInput}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="输入您的问题..."
                                className="w-full bg-transparent outline-none resize-none py-3.5 pl-5 pr-12 text-slate-800 text-[14px] placeholder:text-slate-400 font-medium"
                                style={{ height: '50px', maxHeight: '100px' }}
                            />
                            
                            <button 
                                onClick={handleSend}
                                className={`absolute right-2.5 bottom-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                    inputValue.trim().length > 0 && !isLoading
                                    ? 'bg-slate-900 text-white shadow-sm hover:scale-105 active:scale-95'
                                    : 'bg-transparent text-slate-200 cursor-not-allowed'
                                }`}
                                disabled={inputValue.trim().length === 0 || isLoading}
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
