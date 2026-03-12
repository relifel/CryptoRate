import React, { useState } from 'react';
import { useOutletContext, Navigate, useNavigate } from 'react-router-dom';

/**
 * 详情项辅助组件 - 遵循 Hyper-Minimalism 规范
 * 用于展示个人资料的各项明细，支持宽松的垂直间距和悬停反馈
 */
const ProfileDetailItem = ({ label, value, type = 'text' }) => (
    <div className="flex flex-col gap-2 py-5 border-b border-slate-50 group transition-all hover:bg-slate-50/40 px-4 -mx-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
        <span className={`text-[15px] font-bold text-slate-800 tracking-tight ${type === 'mono' ? 'font-mono text-[14px]' : ''}`}>
            {value || '未设置'}
        </span>
    </div>
);

export default function UserCenter() {
    const { user, setUser } = useOutletContext();
    const navigate = useNavigate();
    
    // 如果没有登录态，直接重定向回首页
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // 登出逻辑：清除上下文及本地存储的 Token
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('cryptorate_user');
        localStorage.removeItem('cryptorate_token');
        navigate('/');
    };

    return (
        <div className="relative min-h-screen bg-slate-50 pb-24 font-sans">
            {/* 核心视觉背景：极简淡网格（在 index.css 中定义的 bg-graph-paper） */}
            <div className="fixed inset-0 z-0 bg-graph-paper pointer-events-none opacity-60"></div>

            {/* 主容器：限制最大宽度并居中，确保大屏下不失控 */}
            <main className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32 lg:pt-40">
                
                {/* 页面标题区 */}
                <div className="mb-14">
                    <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">账户中心</h1>
                    <p className="text-[14px] text-slate-400 font-medium mt-1.5">管理您的数字资产通行证与系统个性化偏好</p>
                </div>

                {/* 核心内容网格布局 (12列划分) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* 左侧侧边栏 (Sidebar - 4列) */}
                    <div className="col-span-1 lg:col-span-4 space-y-8">
                        
                        {/* 1. 简要身份识别卡片 */}
                        <div className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm relative overflow-hidden group">
                            {/* 物理切角装饰点缀 */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 group-hover:bg-slate-200 transition-colors"></div>
                            
                            <div className="flex flex-col items-center text-center">
                                {/* 柔和浅色头像 */}
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-500 text-3xl font-extrabold mb-6 transition-transform group-hover:scale-105 duration-500">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{user.username}</h2>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                    Verified Member
                                </p>
                            </div>
                        </div>

                        {/* 2. 净化后的安全等级卡片 (移除深色块) */}
                        <div className="bg-white p-8 rounded-[28px] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">账号安全概况</span>
                                <div className="h-px flex-1 bg-slate-50"></div>
                            </div>
                            
                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-[13px] font-medium text-slate-500">安全防护等级</span>
                                    <span className="text-[13px] font-bold text-emerald-500/80 bg-emerald-50 px-2.5 py-0.5 rounded-lg">High</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[13px] font-medium text-slate-500">智库引擎版本</span>
                                    <span className="text-[13px] font-bold text-slate-700 font-mono">v2.1 Stable</span>
                                </div>
                            </div>

                            {/* 次要退出按钮：幽灵样式，放在侧边栏底部 */}
                            <div className="mt-8 pt-6 border-t border-slate-50">
                                <button 
                                    onClick={handleLogout}
                                    className="w-full py-3.5 text-rose-500 text-[13px] font-bold rounded-xl hover:bg-rose-50/50 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    退出当前会话
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 右侧主内容区 (Main Content - 8列) */}
                    <div className="col-span-1 lg:col-span-8 space-y-8">
                        
                        {/* 1. 核心资料面板 */}
                        <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm relative">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">基本资料明细</h3>
                                </div>
                                <button className="px-5 py-2 bg-slate-50 text-slate-600 text-[12px] font-bold rounded-xl border border-slate-100 hover:bg-slate-100 hover:-translate-y-0.5 transition-all">
                                    编辑公开资料
                                </button>
                            </div>

                            <div className="space-y-1">
                                <ProfileDetailItem label="用户唯一数字标识 (UID)" value={user.id || 'UID-8910-X'} type="mono" />
                                <ProfileDetailItem label="通讯邮箱 (Security Email)" value={user.email || '未绑定安全邮箱'} />
                                <ProfileDetailItem label="通行证创建时间" value={user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '2025年10月12日'} />
                                <ProfileDetailItem label="最后已知登录位置" value="中国 / 上海 (IPv4: 192.168.*.*)" />
                            </div>

                            {/* 偏好开关组 */}
                            <div className="mt-14 pt-10 border-t border-slate-50">
                                <h3 className="text-lg font-bold text-slate-900 mb-8 tracking-tight">智能推送与偏好设置</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between p-5 bg-slate-50/30 rounded-2xl border border-slate-100/50">
                                        <div className="pr-4">
                                            <p className="text-[14px] font-bold text-slate-800">行情异动实时预警</p>
                                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">自选资产波动超 5% 时推送</p>
                                        </div>
                                        <div className="w-11 h-6 bg-slate-900 rounded-full relative p-1 cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full translate-x-5 transition-transform shadow-sm"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-5 bg-slate-50/30 rounded-2xl border border-slate-100/50">
                                        <div className="pr-4">
                                            <p className="text-[14px] font-bold text-slate-800">AI 智库每日简报</p>
                                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">早间生成全市场行情解读</p>
                                        </div>
                                        <div className="w-11 h-6 bg-slate-200 rounded-full relative p-1 cursor-pointer">
                                            <div className="w-4 h-4 bg-white rounded-full transition-transform shadow-sm"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. 风险警示区 (次级视觉) */}
                        <div className="p-8 bg-rose-50/30 rounded-[28px] border border-rose-100/50 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-rose-500 flex-shrink-0 shadow-sm">
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-rose-600 font-bold text-[15px] mb-1">危险操作区域</h4>
                                <p className="text-[12px] text-slate-500 leading-relaxed italic">
                                    注销账号将永久抹去您的所有收藏监控数据、投资笔记以及资产记录，此操作无法通过任何途径撤销。
                                </p>
                            </div>
                            <button className="px-6 py-2.5 text-[12px] font-bold text-rose-500 hover:underline flex-shrink-0 transition-all">
                                申请身份注销 →
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
