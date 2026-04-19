import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  RotateCcw, 
  Trash2, 
  UserX, 
  UserCheck,
  SearchX,
  Loader2,
  Mail,
  Calendar,
  Key
} from 'lucide-react';
import { adminAPI } from '../api';

/**
 * AccountManagement - 全系统账号管理中心
 * 仅 ADMIN 权限可见，提供对所有用户的状态管控、搜索、重置密码及注销功能。
 */
export default function AccountManagement() {
    const { user: currentUser, setError } = useOutletContext();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // 1. 获取用户列表
    const fetchUsers = async (keyword = '') => {
        try {
            setLoading(true);
            const res = await adminAPI.getUserList(keyword);
            if (res && res.data) {
                setUsers(res.data);
            }
        } catch (err) {
            console.error('获取用户列表失败:', err);
            setError('获取用户列表失败，请检查网络连接');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. 搜索逻辑
    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(searchKeyword);
    };

    // 3. 切换用户状态
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        try {
            setProcessingId(user.id);
            await adminAPI.updateStatus(user.id, newStatus);
            // 本地更新状态
            setUsers(prev => prev.map(u => 
                u.id === user.id ? { ...u, status: newStatus } : u
            ));
        } catch (err) {
            console.error('状态更新失败:', err);
            setError('操作失败，该账号可能已被删除');
        } finally {
            setProcessingId(null);
        }
    };

    // 4. 重置密码
    const handleResetPassword = async (user) => {
        if (!window.confirm(`确定要将用户 [${user.username}] 的密码重置为 123456 吗？`)) return;
        try {
            setProcessingId(user.id);
            await adminAPI.resetPassword(user.id);
            alert(`用户 [${user.username}] 的密码已重置为初始密码 123456`);
        } catch (err) {
            console.error('密码重置失败:', err);
            setError('密码重置失败');
        } finally {
            setProcessingId(null);
        }
    };

    // 5. 删除用户
    const handleDeleteUser = async (user) => {
        if (user.role === 'ADMIN') {
            alert('无法删除管理员账户');
            return;
        }
        if (!window.confirm(`⚠️ 警告：确定要删除用户 [${user.username}] 吗？此操作不可撤销！`)) return;
        try {
            setProcessingId(user.id);
            await adminAPI.deleteUser(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
        } catch (err) {
            console.error('用户删除失败:', err);
            setError('删除用户失败');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="flex-1 bg-slate-50/50 p-8 pt-28">
            <div className="max-w-7xl mx-auto">
                {/* 顶部标题栏 */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 text-indigo-600 mb-2">
                            <ShieldCheck size={24} strokeWidth={2.5} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">System Terminal</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            账号管理中心 <span className="text-slate-300 font-light ml-2">/ Accounts</span>
                        </h1>
                    </div>

                    {/* 搜索栏 */}
                    <form onSubmit={handleSearch} className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="通过用户名或邮箱查询..."
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-80 h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="h-12 px-6 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                        >
                            检索
                        </button>
                    </form>
                </div>

                {/* 主列表区 */}
                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="text-indigo-600 animate-spin" size={40} />
                        <p className="text-sm font-bold text-slate-400">正在同步全平台用户数据...</p>
                    </div>
                ) : users.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {users.map(u => (
                            <div 
                                key={u.id}
                                className={`group bg-white border border-slate-100 p-6 rounded-3xl transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] hover:border-slate-200 flex items-center justify-between overflow-hidden relative ${u.status === 'DISABLED' ? 'opacity-80' : ''}`}
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
                            >
                                {/* 背景装饰 */}
                                <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <Users size={80} strokeWidth={1} />
                                </div>

                                <div className="flex items-center gap-8 flex-1 mr-8">
                                    {/* 状态指示 */}
                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${u.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-300'}`}></div>
                                    
                                    {/* 基本信息 */}
                                    <div className="flex flex-col gap-1 w-48 truncate">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[17px] font-black text-slate-900 truncate">{u.username}</span>
                                            {u.role === 'ADMIN' && (
                                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-md tracking-wider">Admin</span>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">UID: {u.id}</span>
                                    </div>

                                    {/* 邮箱 */}
                                    <div className="hidden lg:flex flex-col gap-1 w-56 truncate">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Mail size={14} />
                                            <span className="text-[14px] font-bold truncate">{u.email || '未绑定邮箱'}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Email Address</span>
                                    </div>

                                    {/* 注册时间 */}
                                    <div className="hidden xl:flex flex-col gap-1 w-48">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Calendar size={14} />
                                            <span className="text-[14px] font-bold">{u.createdAt?.split(' ')[0] || '未知'}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Join Date</span>
                                    </div>

                                    {/* 状态标签 */}
                                    <div className="ml-auto flex items-center">
                                        <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                            {u.status === 'ACTIVE' ? '正常激活' : '已被禁用'}
                                        </div>
                                    </div>
                                </div>

                                {/* 操作按钮组 */}
                                <div className="flex items-center gap-2 border-l border-slate-100 pl-6 h-12">
                                    <button 
                                        onClick={() => handleToggleStatus(u)}
                                        disabled={processingId === u.id || u.id === currentUser?.id}
                                        className={`p-3 rounded-2xl transition-all ${u.status === 'ACTIVE' ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'} disabled:opacity-30`}
                                        title={u.status === 'ACTIVE' ? '禁用账号' : '启用账号'}
                                    >
                                        {u.status === 'ACTIVE' ? <UserX size={20} /> : <UserCheck size={20} />}
                                    </button>
                                    <button 
                                        onClick={() => handleResetPassword(u)}
                                        disabled={processingId === u.id}
                                        className="p-3 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-30"
                                        title="重置密码"
                                    >
                                        <Key size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteUser(u)}
                                        disabled={processingId === u.id || u.role === 'ADMIN'}
                                        className="p-3 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-30"
                                        title="注销账号"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-96 flex flex-col items-center justify-center gap-6 bg-white border border-slate-100 rounded-[2.5rem]">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                            <SearchX size={40} />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-slate-800">未找到相关结果</p>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-tight mt-1">没有匹配关键词 "{searchKeyword}" 的用户</p>
                        </div>
                        <button 
                            onClick={() => { setSearchKeyword(''); fetchUsers(''); }}
                            className="text-indigo-600 text-sm font-black uppercase tracking-widest hover:underline"
                        >
                            重置列表
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
