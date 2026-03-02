import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Minimize2 } from 'lucide-react';

export default function AIChatBox() {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [inputValue, setInputValue] = useState('');

    // 初始 Mock 数据
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: '您好，我是您的 CryptoMonitor 助手。无论是代币行情、白皮书解读还是技术指标，我都能为您提供简明分析。'
        }
    ]);

    const messagesEndRef = useRef(null);

    // 自动滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim() || isTyping) return;

        const newUserMsg = {
            id: Date.now(),
            sender: 'user',
            text: inputValue.trim()
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputValue('');
        setIsTyping(true);

        // 调用 Java 后端 AI 接口，Java 再转发给 Python AI 服务
        const token = localStorage.getItem('cryptorate_token');

        fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 携带 JWT 鉴权 Token
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify({ question: newUserMsg.text }),
        })
            .then(res => res.json())
            .then(data => {
                const aiText = (data.code === 200 && data.data)
                    ? data.data
                    : (data.msg || 'AI 服务暂时不可用，请稍后重试。');
                const newAiMsg = {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: aiText,
                };
                setMessages(prev => [...prev, newAiMsg]);
            })
            .catch(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: '❌ 无法连接到 AI 服务，请确认后端和 Python AI 服务均已启动。',
                }]);
            })
            .finally(() => {
                setIsTyping(false);
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* 聊天面板（展开时显示） */}
            <div
                className={`
          transition-all duration-300 ease-in-out origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 mb-4' : 'opacity-0 scale-95 pointer-events-none absolute bottom-0 right-0'}
          w-[360px] h-[520px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] 
          flex flex-col border border-gray-100 overflow-hidden
        `}
            >
                {/* Header */}
                <div className="bg-gray-50/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Bot size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">Crypto AI 助手</h3>
                            <p className="text-[10px] text-gray-400">Powered by CryptoRate</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="收起"
                    >
                        <Minimize2 size={18} />
                    </button>
                </div>

                {/* 消息对话区 */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#FAFAFA] space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`
                  max-w-[85%] px-4 py-2.5 text-[14px] leading-relaxed break-words
                  ${msg.sender === 'user'
                                        ? 'bg-blue-50 text-blue-900 rounded-2xl rounded-tr-sm'
                                        : 'bg-white text-gray-700 shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm'}
                `}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%] px-4 py-3 bg-white text-gray-500 shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin text-blue-400" />
                                <span className="text-[13px]">AI 正在思考...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* 输入区 */}
                <div className="p-3 bg-white border-t border-gray-100">
                    <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                        <textarea
                            className="flex-1 max-h-[120px] min-h-[40px] bg-transparent text-[14px] text-gray-800 p-2 resize-none focus:outline-none scrollbar-thin overflow-y-auto"
                            placeholder="请输入您的问题... (Shift + Enter 换行)"
                            rows={1}
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                // 简单的自动调整高度
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isTyping}
                            className={`
                p-2 rounded-lg mb-1 mr-1 flex-shrink-0 transition-colors
                ${!inputValue.trim() || isTyping
                                    ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                                    : 'text-white bg-gray-900 hover:bg-gray-800 shadow-sm'}
              `}
                        >
                            <Send size={16} className={isTyping ? "opacity-50" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 悬浮触发按钮 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          relative w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center
          text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)]
          transition-all duration-300 hover:scale-105 active:scale-95
          ${isOpen ? 'rotate-90 scale-90 opacity-0 pointer-events-none absolute' : 'rotate-0 scale-100 opacity-100'}
        `}
            >
                <MessageCircle size={28} />
            </button>

        </div>
    );
}
