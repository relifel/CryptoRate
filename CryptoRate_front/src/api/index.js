/**
 * API 请求封装模块
 * 统一管理所有后端接口调用，含登录态拦截器
 */

// API 基础配置
const API_CONFIG = {
  BASE_URL: '',
  BASE_URL_V1: '/api/v1',
  TIMEOUT: 10000, // 10秒超时
};

/** 本地存储的 JWT Token key */
const AUTH_TOKEN_KEY = 'cryptorate_token';

/** 本地存储的登录用户信息 key（兼容旧版保留） */
const AUTH_STORAGE_KEY = 'cryptorate_user';

/**
 * 从 localStorage 读取 JWT Token
 * @returns {string|null}
 */
function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || null;
}

/**
 * 将 JWT Token 保存到 localStorage
 * @param {string} token - JWT Token 字符串
 */
export function saveToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * 清除 JWT Token 和用户信息（退出登录时调用）
 */
export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * 从本地存储读取当前登录用户（用于 UI 展示）
 * @returns {{ id: number, username: string } | null}
 */
function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * 请求拦截：自动从 localStorage 读取 JWT Token 并附加到 Authorization 请求头。
 * 登录/注册接口不附加 Token（公开接口）。
 * @param {string} url - 请求地址
 * @param {object} headers - 已有请求头
 * @returns {object} 附加 Authorization 头后的请求头
 */
function attachAuthHeaders(url, headers) {
  if (!url || typeof url !== 'string') return headers;
  // 公开接口不需要附加 Token
  const isPublicUrl = url.includes('/user/login') || url.includes('/user/register');
  if (isPublicUrl) return headers;
  const token = getToken();
  if (!token) return headers;
  return {
    ...headers,
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * 响应拦截：收到业务码 401 或 HTTP 401 时，清除本地 Token 并跳转到登录页。
 * @param {object} data - 解析后的响应体
 */
function handleResponseAuth(data) {
  if (data && data.code === 401) {
    clearAuth();
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
}

/**
 * 通用请求函数（已接入请求/响应拦截器）
 * @param {string} url - 请求地址
 * @param {object} options - 请求配置
 * @returns {Promise} 返回解析后的数据
 */
/**
 * 通用请求函数（标准化的请求、响应拦截器）
 * @param {string} url - 请求地址
 * @param {object} options - 请求配置 { method, body, headers, ... }
 * @returns {Promise} 返回解析后的 JSON 数据
 */
async function request(url, options = {}) {
  // 1. 数据序列化处理 (移交此层统一管控)
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  // 2. 合并请求头
  const headers = attachAuthHeaders(url, {
    'Content-Type': 'application/json',
    ...options.headers,
  });

  // 3. 构建完整的配置
  const config = {
    method: (options.method || 'GET').toUpperCase(),
    ...options,
    body,    // 使用本层生成的序列化 body
    headers, // 使用本层增强后的 headers
  };

  try {
    const response = await fetch(url, config);
    
    // 支持解析非 200 响应体 (通常是业务错误对象)
    const data = await response.json();

    // 登录态拦截逻辑
    handleResponseAuth(data);

    if (data.code !== 200) {
      // 抛出具体响应消息，便于前端捕获展现
      throw new Error(data.msg || `请求失败 (${data.code})`);
    }

    return data;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      console.error('解析响应 JSON 失败:', error);
      throw new Error('服务器响应格式异常');
    }
    console.error('API请求执行异常:', error);
    throw error;
  }
}

/**
 * 汇率数据接口
 */
export const rateAPI = {
  getSymbols: () => request(`${API_CONFIG.BASE_URL_V1}/rates/symbols`),

  searchSymbols: (keyword = '') => {
    const url = keyword.trim()
      ? `${API_CONFIG.BASE_URL_V1}/rates/search?keyword=${encodeURIComponent(keyword.trim())}`
      : `${API_CONFIG.BASE_URL_V1}/rates/search`;
    return request(url);
  },

  getLatest: (symbol = null) => {
    const url = symbol
      ? `${API_CONFIG.BASE_URL_V1}/rates/latest?symbol=${symbol}`
      : `${API_CONFIG.BASE_URL_V1}/rates/latest`;
    return request(url);
  },

  getHistory: (symbol, start, end) => {
    const url = `${API_CONFIG.BASE_URL_V1}/rates/history?symbol=${symbol}&start=${start}&end=${end}`;
    return request(url);
  },
};

/**
 * 统计分析接口
 */
export const statsAPI = {
  getSummary: (symbol, range = '7d') => {
    const url = `${API_CONFIG.BASE_URL_V1}/stats/summary/${symbol}?range=${range}`;
    return request(url);
  },
};

/**
 * 用户资产管理接口
 */
export const assetAPI = {
  getAssets: () => request(`${API_CONFIG.BASE_URL_V1}/assets`),

  saveAsset: (asset) => request(`${API_CONFIG.BASE_URL_V1}/assets`, {
    method: 'POST',
    body: asset,
  }),

  deleteAsset: (id) => request(`${API_CONFIG.BASE_URL_V1}/assets/${id}`, {
    method: 'DELETE',
  }),
};

/**
 * 智能分析接口
 */
export const analysisAPI = {
  getExplanation: (symbol) => request(`${API_CONFIG.BASE_URL_V1}/analysis/explain/${symbol}`),
};

/**
 * AI 智能问答接口
 */
export const aiAPI = {
  chat: (question) => request(`/api/ai/chat`, {
    method: 'POST',
    body: { question },
  }),

  chatStream: async (question, onMessage, onError, onComplete) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({ question }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        let position = 0;
        while (true) {
          const newlineIndex = buffer.indexOf('\n', position);
          if (newlineIndex === -1) break;
          const line = buffer.substring(position, newlineIndex);
          position = newlineIndex + 1;
          if (line.startsWith('data:')) {
             try {
                const jsonStr = line.substring(5).trim();
                const data = JSON.parse(jsonStr);
                if (data.code === 500) onError(new Error(data.answer));
                else if (data.answer) onMessage(data.answer);
             } catch (e) {}
          }
        }
        buffer = buffer.substring(position);
        if (done) break;
      }
      onComplete();
    } catch (e) { onError(e); }
  },
};

/**
 * 管理后台接口
 */
export const adminAPI = {
  syncData: () => request(`${API_CONFIG.BASE_URL_V1}/admin/sync`, { method: 'POST' }),
  syncHistory: (days = 365) => request(`${API_CONFIG.BASE_URL_V1}/admin/sync-history?days=${days}`, { method: 'POST' }),

  /** 获取全平台用户列表 (支持关键字搜索) */
  getUserList: (keyword) => request(`${API_CONFIG.BASE_URL_V1}/admin/user/list`, { params: { keyword } }),

  /** 更新用户状态 (ACTIVE/DISABLED) */
  updateStatus: (id, status) => request(`${API_CONFIG.BASE_URL_V1}/admin/user/status`, {
    method: 'PUT',
    body: { id, status },
  }),

  /** 重置用户密码为 123456 */
  resetPassword: (id) => request(`${API_CONFIG.BASE_URL_V1}/admin/user/password/reset/${id}`, { method: 'PUT' }),

  /** 删除用户账号 */
  deleteUser: (id) => request(`${API_CONFIG.BASE_URL_V1}/admin/user/${id}`, { method: 'DELETE' }),
};

/**
 * 原有市场数据接口（兼容）
 */
export const marketAPI = {
  getAllRates: () => request(`${API_CONFIG.BASE_URL}/market/rates`),
  getRate: (symbol) => request(`${API_CONFIG.BASE_URL}/market/rate/${symbol}`),
};

/**
 * 用户管理接口
 */
export const userAPI = {
  login: (body) => request(`${API_CONFIG.BASE_URL}/user/login`, {
    method: 'POST',
    body: { username: body.username, password: body.password },
  }),
  register: (user) => request(`${API_CONFIG.BASE_URL}/user/register`, { method: 'POST', body: user }),
  getUserById: (id) => request(`${API_CONFIG.BASE_URL}/user/${id}`),
  getUserByUsername: (username) => request(`${API_CONFIG.BASE_URL}/user/username/${username}`),
  updateUser: (id, user) => request(`${API_CONFIG.BASE_URL}/user/${id}`, { method: 'PUT', body: user }),
  deleteUser: (id) => request(`${API_CONFIG.BASE_URL}/user/${id}`, { method: 'DELETE' }),
};

export { API_CONFIG };

/**
 * 用户收藏接口（标准化调用）
 */
export const favoriteAPI = {
  getList: () => request(`${API_CONFIG.BASE_URL_V1}/favorites/list`),
  add: (symbol) => request(`${API_CONFIG.BASE_URL_V1}/favorites/${symbol}`, { method: 'POST' }),
  remove: (symbol) => request(`${API_CONFIG.BASE_URL_V1}/favorites/${symbol}`, { method: 'DELETE' }),
  
  batchRemove: (symbols) => request(`${API_CONFIG.BASE_URL_V1}/favorites/batch`, {
    method: 'DELETE',
    body: { symbols },
  }),

  updateNote: (symbol, note) => request(`${API_CONFIG.BASE_URL_V1}/favorites/${symbol}/note`, {
    method: 'PUT',
    body: { note },
  }),

  updateAlert: (symbol, priceUpper, priceLower) => request(`${API_CONFIG.BASE_URL_V1}/favorites/${symbol}/alert`, {
    method: 'PUT',
    body: { priceUpper, priceLower },
  }),

  updateSort: (sortList) => request(`${API_CONFIG.BASE_URL_V1}/favorites/sort`, {
    method: 'PUT',
    body: sortList,
  }),
};

/**
 * 用户个人中心接口
 */
export const profileAPI = {
  getProfile: () => request(`${API_CONFIG.BASE_URL}/user/profile`),
  updateProfile: (dto) => request(`${API_CONFIG.BASE_URL}/user/profile`, { method: 'PUT', body: dto }),
  changePassword: (dto) => request(`${API_CONFIG.BASE_URL}/user/password`, { method: 'PUT', body: dto }),
};
