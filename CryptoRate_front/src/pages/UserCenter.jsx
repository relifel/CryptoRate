import React, { useState, useEffect } from 'react';
import { useOutletContext, Navigate, useNavigate } from 'react-router-dom';
import { profileAPI } from '../api';

/**
 * 详情项辅助组件 - 遵循 Hyper-Minimalism 规范
 */
const ProfileDetailItem = ({ label, value, type = 'text' }) => (
    <div className="flex flex-col gap-1.5 py-4 border-b border-slate-100 group transition-colors hover:bg-slate-50/50 px-2 rounded-lg">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{label}</span>
        <span className={`text-[15px] font-bold text-slate-800 tracking-tight ${type === 'mono' ? 'font-mono' : ''}`}>
            {value || '未设置'}
        </span>
    </div>
);

export default function UserCenter() {
    const { user, setUser } = useOutletContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // 如果没有登录态，直接重定向
    if (!user) {
        return <Navigate to="/" replace />;
    }

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('cryptorate_user');
        localStorage.removeItem('cryptorate_token');
        navigate('/');
    };

    return (
        <div className="relative min-h-screen bg-slate-50 pb-24 font-sans">
            {/* 极简网格背景 */}
            <div className="fixed inset-0 z-0 bg-graph-paper pointer-events-none opacity-60"></div>

            <main className="relative z-10 max-w-[1000px] mx-auto px-10 pt-32">
                
                {/* 标题区 */}
                <div className="mb-12">
                    <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">账户中心</h1>
                    <p className="text-[13px] text-slate-400 font-medium mt-1">管理您的个人资料、安全设置与偏好配置</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* 左侧：核心身份卡片 */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm chamfer-card relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-900"></div>
                            
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900">{user.username}</h2>
                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Member</p>
                                
                                <div className="w-full h-px bg-slate-50 my-6"></div>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="w-full py-3 bg-white border border-rose-100 text-rose-500 text-[13px] font-bold rounded-xl hover:bg-rose-50 transition-all active:scale-95"
                                >
                                    退出登录
                                </button>
                            </div>
                        </div>

                        {/* 系统标签 */}
                        <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Account Security</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[12px] font-medium text-slate-400">Security Level</span>
                                        <span className="text-[12px] font-bold text-emerald-400">High</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[12px] font-medium text-slate-400">AI Integration</span>
                                        <span className="text-[12px] font-bold text-blue-400">v2.1 Stable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右侧：详细配置区 */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-bold text-slate-900">个人资料详情</h3>
                                <button className="px-4 py-1.5 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-lg border border-slate-100 hover:bg-slate-100 transition-all">
                                    编辑资料
                                </button>
                            </div>

                            <div className="space-y-2">
                                <ProfileDetailItem label="用户唯一标识" value={user.id || 'UID-10001'} type="mono" />
                                <ProfileDetailItem label="电子邮箱地址" value={user.email || '未绑定'} />
                                <ProfileDetailItem label="账号创建时间" value={user.createdAt ? new Date(user.createdAt).toLocaleString() : '2025-01-01'} />
                                <ProfileDetailItem label="最后登录地点" value="CN / Shanghai" />
                            </div>

                            {/* 设置开关组 */}
                            <div className="mt-12 space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">通知与智能偏好</h3>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <div>
                                        <p className="text-[14px] font-bold text-slate-800">价格剧烈波动预警</p>
                                        <p className="text-[11px] text-slate-400 font-medium">当您收藏的币种在 1H 内波动超过 5% 时提醒</p>
                                    </div>
                                    <div className="w-11 h-6 bg-slate-900 rounded-full relative p-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full translate-x-5 transition-transform shadow-sm"></div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                    <div>
                                        <p className="text-[14px] font-bold text-slate-800">AI 行情自动推送</p>
                                        <p className="text-[11px] text-slate-400 font-medium">每日早间为您推送今日智库分析简报</p>
                                    </div>
                                    <div className="w-11 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full transition-transform shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 危险操作区 */}
                        <div className="p-8 border border-rose-100 bg-rose-50/20 rounded-3xl">
                            <h4 className="text-rose-500 font-bold text-sm mb-2">敏感操作</h4>
                            <p className="text-[12px] text-slate-500 mb-4">如果您不再使用本智库，可以选择注销您的账号。此操作不可撤销。</p>
                            <button className="text-[12px] font-bold text-rose-500 hover:underline">
                                申请注销账号 →
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
