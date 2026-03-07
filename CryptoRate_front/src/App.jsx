import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Header from './components/Header';
import AIChatBox from './components/AIChatBox';
import Login from './pages/Login';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Assets from './pages/Assets';
import Analysis from './pages/Analysis';
import UserProfile from './components/UserProfile';
import { favoriteAPI, rateAPI } from './api';

const USER_STORAGE_KEY = 'cryptorate_user';

function Layout() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [showLoginPage, setShowLoginPage] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [latestRates, setLatestRates] = useState({});
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [loadingGlobal, setLoadingGlobal] = useState({ latest: false });

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
    const interval = setInterval(fetchLatestRates, 30000);
    return () => clearInterval(interval);
  }, []);

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

  if (showLoginPage) {
    return (
      <Login
        onSuccess={(userData) => {
          setUser({ username: userData.username });
          try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ username: userData.username }));
          } catch (_) { }
          setShowLoginPage(false);
        }}
        onCancel={() => setShowLoginPage(false)}
      />
    );
  }

  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col overflow-hidden">
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

      {/* Header */}
      <Header
        user={user}
        setUser={setUser}
        setShowLoginPage={setShowLoginPage}
        favoritesCount={favorites.length}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden h-full relative">
        <Outlet
          context={{
            user,
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
      </div>

      {/* AI Bot */}
      <AIChatBox />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="assets" element={<Assets />} />
          <Route path="analysis" element={<Analysis />} />
          {/* Profile wrapped in standard container style from old App */}
          <Route path="profile" element={<div className="flex-1 overflow-y-auto bg-gray-50"><UserProfile /></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
