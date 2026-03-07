import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Analysis() {
    const navigate = useNavigate();
    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={24} className="text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">AI 智能分析</h2>
                </div>
                <p className="text-gray-500 mb-6">在左侧市场页面选择币种后，点击"AI 分析"按钮即可获取该币种的智能分析报告。</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                >
                    回到市场
                </button>
            </div>
        </div>
    );
}
