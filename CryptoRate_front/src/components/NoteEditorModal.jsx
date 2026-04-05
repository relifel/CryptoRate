import React, { useState, useEffect } from 'react';

/**
 * NoteEditorModal - 投资笔记高质感编辑器组件
 * 
 * @param {boolean} isOpen - 是否开启
 * @param {string} symbol - 当前币种
 * @param {string} initialNote - 初始笔记内容
 * @param {function} onSave - 保存回调 (note)
 * @param {function} onClose - 关闭回调
 * @param {boolean} isSaving - 保存状态反馈
 */
const NoteEditorModal = ({ isOpen, symbol, initialNote, onSave, onClose, isSaving }) => {
    const [note, setNote] = useState(initialNote || '');

    // 每次打开同步状态
    useEffect(() => {
        if (isOpen) {
            setNote(initialNote || '');
        }
    }, [isOpen, initialNote]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 背景遮罩 - 毛玻璃效果 */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal 内容容器 */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
                
                {/* 头部 */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">投资笔记 - {symbol}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">记录您的建仓逻辑与操盘计划</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* 主体自适应输入区 */}
                <div className="p-6">
                    <textarea
                        className="w-full min-h-[220px] p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none text-[15px] leading-relaxed"
                        placeholder="写下您的投资逻辑... (例如：形态突破、支撑位建仓、基本面利好等)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        autoFocus
                    ></textarea>
                    
                    <div className="mt-3 flex justify-end">
                        <span className={`text-[11px] font-medium ${note.length > 1800 ? 'text-rose-500' : 'text-slate-400'}`}>
                            {note.length} / 2000 字符
                        </span>
                    </div>
                </div>

                {/* 底部按钮栏 */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-all"
                    >
                        取消
                    </button>
                    <button
                        onClick={() => onSave(note)}
                        disabled={isSaving}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg shadow-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                保存中...
                            </>
                        ) : '保存笔记'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteEditorModal;
