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

/** 本地存储的登录用户 key，与 App 中一致 */
const AUTH_STORAGE_KEY = 'cryptorate_user';

/**
 * 从本地存储读取当前登录用户（用于请求头）
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
 * 请求拦截：为已登录用户自动附加身份头（需登录的接口可由后端校验）
 * 登录/注册接口不附加，避免无意义带参
 */
function attachAuthHeaders(url, headers) {
  if (!url || typeof url !== 'string') return headers;
  const isAuthUrl = url.includes('/user/login') || url.includes('/user/register');
  if (isAuthUrl) return headers;
  const user = getStoredUser();
  if (!user || !user.id) return headers;
  return {
    ...headers,
    'X-User-Id': String(user.id),
    'X-Username': user.username || '',
  };
}

/**
 * 响应拦截：业务码 401 时清除登录态并通知应用跳转登录页
 */
function handleResponseAuth(data) {
  if (data && data.code === 401) {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (_) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:logout'));
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
