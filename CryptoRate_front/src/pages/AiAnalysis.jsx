import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../api';

/**
 * 沉浸式居中布局 AI 独立对话页 (Gemini/ChatGPT Style)
 */
export default function AiAnalysis() {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [messages, setMessages] = useState([]); // store messages history
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const textareaRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto resize input
    const handleInput = (e) => {
        setInputValue(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`; // Max 120px
        }
    };

    // Send message and handle stream
    const handleSend = async () => {
        const question = inputValue.trim();
        if (!question || isLoadingAI) return;
        
        const userMsg = { id: Date.now(), text: question, sender: 'user' };
        // 创建一个空内容的 AI 占位消息，供流式拼接
        const aiMsgId = Date.now() + 1;
        const aiMsg = { id: aiMsgId, text: "", sender: 'ai' };
        
        setMessages(prev => [...prev, userMsg, aiMsg]);
        setInputValue('');
        setIsLoadingAI(true);

        if (textareaRef.current) textareaRef.current.style.height = '60px'; 

        aiAPI.chatStream(
            question,
            (chunkText) => {
                // 每次接收到新的 chunk 时，追加到对应的 AI 消息上
                setIsLoadingAI(false); // 收到首包后隐藏加载动画
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMsgId ? { ...msg, text: msg.text + chunkText } : msg
                ));
            },
            (err) => {
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMsgId ? { ...msg, text: `❌ 服务暂时不可用: ${err.message}` } : msg
                ));
                setIsLoadingAI(false);
            },
            () => {
                // 流结束
                setIsLoadingAI(false);
            }
        );
    };

    return (
        <div id="ai-analysis-page" className="w-full flex-1 flex flex-col bg-slate-50 font-sans relative">
            
            {/* Top Spacer to clear Absolute Navbar */}
            <div className="h-20 shrink-0"></div>

            {/* 发消息区居中的 Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto w-full px-6 scroll-smooth pb-32">
                {messages.length === 0 ? (
                    
                    /* 空状态：极简居中问候区 */
                    <div className="flex-1 w-full flex flex-col justify-center items-center pb-24">
                        <div className="text-center max-w-3xl">
                            <p className="flex items-center justify-center gap-2 text-[15px] font-medium text-slate-500 mb-4">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                                </svg>
                                你好，探索者
                            </p>
                            <h1 className="text-4xl md:text-[2.75rem] leading-tight font-light text-slate-800 tracking-tight">
                                今天想探索哪个加密资产？
                            </h1>
                        </div>
                    </div>
                    
                ) : (
                    
                    /* 对话状态：聊天气泡列表居中 */
                    <div className="max-w-3xl mx-auto flex flex-col gap-8 pt-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-6 py-4 rounded-[28px] max-w-[85%] leading-relaxed shadow-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-slate-100 text-slate-800 rounded-br-sm' 
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
                                }`}>
                                    {msg.sender === 'ai' && (
                                        <div className="flex items-center gap-2 mb-3">
                                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
                                            </svg>
                                            <span className="font-semibold text-[13.5px] text-slate-900 tracking-wide">CryptoRate AI</span>
                                        </div>
                                    )}
                                    <div className="text-[16px] whitespace-pre-wrap">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        {isLoadingAI && (
                            <div className="flex justify-start">
                                <div className="bg-white text-slate-400 border border-slate-100 rounded-[28px] rounded-bl-sm px-6 py-4 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4 shrink-0" />
                    </div>
                    
                )}
            </div>

            {/* 底部固定输入区 Bottom Fixed Input / 带有渐变遮罩防止文字穿模 */}
            <div className="absolute bottom-0 left-0 w-full pt-16 pb-8 px-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none">
                <div className="max-w-3xl mx-auto flex flex-col pointer-events-auto">
                    
                    {/* 胶囊型智能输入框 The Pill Chat Input */}
                    <div 
                        className={`relative w-full rounded-[2rem] bg-white border transition-all duration-300 ease-out flex items-end ${
                            isFocused 
                            ? 'border-indigo-400 shadow-[0_8px_30px_rgb(99,102,241,0.08)]' 
                            : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
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
                            placeholder="输入币种名称，或询问市场趋势..."
                            className="w-full max-h-[120px] bg-transparent outline-none resize-none py-4 pl-6 pr-14 text-slate-800 text-[16px] placeholder:text-slate-400 font-medium leading-relaxed"
                            style={{ height: '60px', overflowY: inputValue.split('\n').length > 2 ? 'auto' : 'hidden' }}
                        />

                        {/* 极简发送图标 Sending Icon */}
                        <button 
                            className={`absolute right-3 bottom-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                inputValue.trim().length > 0
                                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:scale-105 active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            disabled={inputValue.trim().length === 0}
                            onClick={handleSend}
                        >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* 极简底部署名或提示 */}
                    <div className="mt-4 text-center">
                        <p className="text-[12px] text-slate-400/80 font-medium tracking-wide">
                            CryptoRate AI 能够回答与加密货币市场相关的分析问题。
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}
