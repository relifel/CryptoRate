/**
 * API 请求封装模块
 * 统一管理所有后端接口调用，含登录态拦截器
 */

// API 基础配置
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  BASE_URL_V1: 'http://localhost:8080/api/v1',
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
async function request(url, options = {}) {
  const headers = attachAuthHeaders(url, {
    'Content-Type': 'application/json',
    ...options.headers,
  });
  const config = {
    method: options.method || 'GET',
    headers,
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    handleResponseAuth(data);

    if (data.code !== 200) {
      throw new Error(data.msg || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
}

/**
 * 汇率数据接口
 */
export const rateAPI = {
  /**
   * 获取系统支持的币种列表
   */
  getSymbols: () => {
    return request(`${API_CONFIG.BASE_URL_V1}/rates/symbols`);
  },

  /**
   * 搜索币种（按币种代码模糊匹配）
   * @param {string} keyword - 搜索关键词（可选，为空时返回全部）
   */
  searchSymbols: (keyword = '') => {
    const url = keyword.trim()
      ? `${API_CONFIG.BASE_URL_V1}/rates/search?keyword=${encodeURIComponent(keyword.trim())}`
      : `${API_CONFIG.BASE_URL_V1}/rates/search`;
    return request(url);
  },

  /**
   * 获取最新实时汇率
   * @param {string} symbol - 币种代码（可选）
   */
  getLatest: (symbol = null) => {
    const url = symbol 
      ? `${API_CONFIG.BASE_URL_V1}/rates/latest?symbol=${symbol}`
      : `${API_CONFIG.BASE_URL_V1}/rates/latest`;
    return request(url);
  },

  /**
   * 查询历史汇率
   * @param {string} symbol - 币种代码
   * @param {string} start - 开始日期 (yyyy-MM-dd)
   * @param {string} end - 结束日期 (yyyy-MM-dd)
   */
  getHistory: (symbol, start, end) => {
    const url = `${API_CONFIG.BASE_URL_V1}/rates/history?symbol=${symbol}&start=${start}&end=${end}`;
    return request(url);
  },
};

/**
 * 统计分析接口
 */
export const statsAPI = {
  /**
   * 获取汇率统计摘要
   * @param {string} symbol - 币种代码
   * @param {string} range - 时间范围 (7d/30d)
   */
  getSummary: (symbol, range = '7d') => {
    const url = `${API_CONFIG.BASE_URL_V1}/stats/summary/${symbol}?range=${range}`;
    return request(url);
  },
};

/**
 * 用户资产管理接口
 */
export const assetAPI = {
  /**
   * 查询个人资产记录
   */
  getAssets: () => {
    return request(`${API_CONFIG.BASE_URL_V1}/assets`);
  },

  /**
   * 添加/修改资产
   * @param {object} asset - 资产信息 {symbol, amount}
   */
  saveAsset: (asset) => {
    return request(`${API_CONFIG.BASE_URL_V1}/assets`, {
      method: 'POST',
      body: asset,
    });
  },

  /**
   * 删除资产记录
   * @param {number} id - 资产ID
   */
  deleteAsset: (id) => {
    return request(`${API_CONFIG.BASE_URL_V1}/assets/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * 智能分析接口
 */
export const analysisAPI = {
  /**
   * 生成行情解读
   * @param {string} symbol - 币种代码
   */
  getExplanation: (symbol) => {
    return request(`${API_CONFIG.BASE_URL_V1}/analysis/explain/${symbol}`);
  },
};

/**
 * 管理后台接口
 */
export const adminAPI = {
  /**
   * 手动触发数据采集
   */
  syncData: () => {
    return request(`${API_CONFIG.BASE_URL_V1}/admin/sync`, {
      method: 'POST',
    });
  },
};

/**
 * 原有市场数据接口（兼容）
 */
export const marketAPI = {
  /**
   * 获取所有加密货币汇率
   */
  getAllRates: () => {
    return request(`${API_CONFIG.BASE_URL}/market/rates`);
  },

  /**
   * 获取单个加密货币汇率
   * @param {string} symbol - 币种代码
   */
  getRate: (symbol) => {
    return request(`${API_CONFIG.BASE_URL}/market/rate/${symbol}`);
  },
};

/**
 * 用户管理接口
 */
export const userAPI = {
  /**
   * 用户登录
   * @param {object} body - { username, password }
   * @returns {Promise<{ data: { id, username, email, createdAt } }>}
   */
  login: (body) => {
    return request(`${API_CONFIG.BASE_URL}/user/login`, {
      method: 'POST',
      body: { username: body.username, password: body.password },
    });
    // 注意：登录成功后需由调用方手动 saveToken(data.data) 保存 JWT Token
  },

  /**
   * 用户注册
   * @param {object} user - 用户信息 {username, password, email}
   */
  register: (user) => {
    return request(`${API_CONFIG.BASE_URL}/user/register`, {
      method: 'POST',
      body: user,
    });
  },

  /**
   * 根据ID查询用户
   * @param {number} id - 用户ID
   */
  getUserById: (id) => {
    return request(`${API_CONFIG.BASE_URL}/user/${id}`);
  },

  /**
   * 根据用户名查询用户
   * @param {string} username - 用户名
   */
  getUserByUsername: (username) => {
    return request(`${API_CONFIG.BASE_URL}/user/username/${username}`);
  },

  /**
   * 更新用户信息
   * @param {number} id - 用户ID
   * @param {object} user - 更新的用户信息
   */
  updateUser: (id, user) => {
    return request(`${API_CONFIG.BASE_URL}/user/${id}`, {
      method: 'PUT',
      body: user,
    });
  },

  /**
   * 删除用户
   * @param {number} id - 用户ID
   */
  deleteUser: (id) => {
    return request(`${API_CONFIG.BASE_URL}/user/${id}`, {
      method: 'DELETE',
    });
  },
};

// 导出配置供外部使用
export { API_CONFIG };
