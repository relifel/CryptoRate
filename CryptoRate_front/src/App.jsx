import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Login from './pages/Login';
import Home from './pages/Home';
import Assets from './pages/Assets';
import Favorites from './pages/Favorites';
import AiAnalysis from './pages/AiAnalysis';
import UserCenter from './pages/UserCenter';
import Navbar from './components/Navbar';
import FloatingAiChat from './components/FloatingAiChat';
import { favoriteAPI, rateAPI, profileAPI } from './api';

const USER_STORAGE_KEY = 'cryptorate_user';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [showLoginPage, setShowLoginPage] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [latestRates, setLatestRates] = useState({});
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [loadingGlobal, setLoadingGlobal] = useState({ latest: false });

  // 0. 初始化：尝试根据 Token 拉取用户信息
  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem('cryptorate_token');
      if (token) {
        try {
          const res = await profileAPI.getProfile();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('初始化用户信息失败:', err);
          // 如果 Token 失效，清除本地状态
          localStorage.removeItem('cryptorate_token');
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
      setIsInitializing(false);
    };
    initUser();
  }, []);

  // 1. 加载收藏列表
  const loadFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const res = await favoriteAPI.getList();
      if (res && res.data && Array.isArray(res.data)) {
        setFavorites(res.data);
      }
    } catch (err) {
      console.error('加载收藏列表失败:', err);
    }
  }, [user]);

  // 2. 登录后初始化
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    loadFavorites();
  }, [user, loadFavorites]);

  // 3. 定时获取最新汇率
  useEffect(() => {
    const fetchLatestRates = async () => {
      try {
        setLoadingGlobal(prev => ({ ...prev, latest: true }));
        const response = await rateAPI.getLatest();
        if (response.data && Array.isArray(response.data)) {
          const ratesMap = {};
          response.data.forEach(item => {
            ratesMap[item.symbol] = item.rate;
          });
          setLatestRates(ratesMap);
        }
      } catch (err) {
        console.error('获取最新汇率失败:', err);
        setErrorGlobal('获取最新汇率失败，请检查后端服务');
      } finally {
        setLoadingGlobal(prev => ({ ...prev, latest: false }));
      }
    };

    fetchLatestRates();
    // 已根据用户要求禁用前端自动轮询 (setInterval)，
    // 以防止后端控制台在演示期间持续刷新日志。
    // const interval = setInterval(fetchLatestRates, 30000);
    // return () => clearInterval(interval);
  }, []);

  // 每一路径变化，重置滚动位置且强制刷新内部渲染
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isFavorited = (symbol) => {
    return favorites.some(f => (typeof f === 'string' ? f : f.symbol) === symbol);
  };

  const toggleFavorite = async (symbol) => {
    if (!user) {
      setShowLoginPage(true);
      return;
    }
    const isFav = isFavorited(symbol);
    try {
      if (isFav) {
        await favoriteAPI.remove(symbol);
        setFavorites(prev => prev.filter(f => (typeof f === 'string' ? f : f.symbol) !== symbol));
      } else {
        await favoriteAPI.add(symbol);
        setFavorites(prev => [...prev, { symbol, sortOrder: 0, createdAt: new Date().toISOString() }]);
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
      setErrorGlobal(isFav ? '取消收藏失败' : '收藏失败，请重试');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setFavorites([]);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem('cryptorate_token');
    } catch (_) { }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400">正在加载智库核心...</p>
        </div>
      </div>
    );
  }

  if (showLoginPage || location.pathname === '/login') {
    return (
      <Login
        onSuccess={async (userData) => {
          // 登录成功后立刻拉取完整资料
          try {
            const res = await profileAPI.getProfile();
            if (res && res.data) {
              setUser(res.data);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data));
              setShowLoginPage(false);
              navigate('/');
            }
          } catch (err) {
            console.error('登录后拉取资料失败:', err);
            // 降级使用传入的基本信息
            setUser({ username: userData.username });
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ username: userData.username }));
            setShowLoginPage(false);
            navigate('/');
          }
        }}
        onCancel={() => { setShowLoginPage(false); navigate('/'); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* 全局错误提示 */}
      {errorGlobal && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3 relative z-50">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{errorGlobal}</p>
            <button
              onClick={() => setErrorGlobal(null)}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              关闭
            </button>
          </div>
        </div>
      )}



      {/* Main Content Area */}
      <Navbar user={user} setShowLoginPage={setShowLoginPage} onLogout={handleLogout} />

      <div className="flex flex-1 flex-col relative">
        <main className="flex-1 flex flex-col items-stretch">
          <Outlet
            context={{
              user,
              setUser,
              setShowLoginPage,
              favorites,
              setFavorites,
              toggleFavorite,
              latestRates,
              loadFavorites,
              error: errorGlobal,
              setError: setErrorGlobal
            }}
          />
        </main>
        {/* 全局悬浮 AI 聊天助手 */}
        <FloatingAiChat />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="assets" element={<Assets />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="analysis" element={<AiAnalysis />} />
          <Route path="user-center" element={<UserCenter />} />
          <Route path="login" element={null} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
