import React, { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { userAPI, saveToken } from '../api';

/**
 * 登录/注册页面
 *
 * 支持切换：登录（用户名、密码）、注册（用户名、密码、邮箱）
 *
 * 登录流程：
 * 1. 调用 POST /user/login 接口
 * 2. 后端返回 JWT Token（data 字段）
 * 3. 调用 saveToken() 将 Token 存入 localStorage
 * 4. 调用 onSuccess 通知父组件更新登录状态
 *
 * 注册流程：
 * 1. 调用 POST /user/register 接口
 * 2. 注册成功后自动切换到登录模式
 */
export default function Login({ onSuccess, onCancel }) {
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /** 处理登录 */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const u = username.trim();
    if (!u || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      const res = await userAPI.login({ username: u, password });
      if (res && res.data) {
        // 将后端返回的 JWT Token 存入 localStorage
        saveToken(res.data);
        // 通知父组件登录成功（传入用户名用于 UI 展示）
        onSuccess && onSuccess({ username: u, token: res.data });
      } else {
        setError('登录失败，请重试');
      }
    } catch (err) {
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  /** 处理注册 */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const u = username.trim();
    if (!u || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    try {
      await userAPI.register({ username: u, password, email: email.trim() || undefined });
      // 注册成功后自动切换到登录模式，并填充用户名
      setSuccessMsg('注册成功！请使用新账号登录');
      setIsRegister(false);
      setPassword('');
    } catch (err) {
      setError(err.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isRegister ? handleRegister : handleLogin;

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">CryptoRate</h1>
          <p className="text-sm text-gray-500 mt-2">加密货币价格追踪</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* 错误提示 */}
          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 成功提示 */}
          {successMsg && (
            <div className="mb-4 flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              <span>✓ {successMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名（3~20 位）"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? '请输入密码（6~20 位）' : '请输入密码'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                disabled={loading}
              />
            </div>
            {isRegister && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱 <span className="text-gray-400">（选填）</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isRegister ? '注册中...' : '登录中...'}
                </>
              ) : (
                isRegister ? '注 册' : '登 录'
              )}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="w-full py-2.5 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
              >
                取消
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            {isRegister ? '已有账号？' : '还没有账号？'}
            <button
              type="button"
              onClick={switchMode}
              disabled={loading}
              className="text-gray-900 font-medium hover:underline ml-1 disabled:opacity-60"
            >
              {isRegister ? '去登录' : '去注册'}
            </button>
          </p>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          {isRegister ? '注册即表示您同意使用本系统' : '登录即表示您同意使用本系统查看行情与收藏'}
        </p>
      </div>
    </div>
  );
}
