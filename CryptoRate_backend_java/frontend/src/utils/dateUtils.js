/**
 * 日期工具函数
 * 用于格式化日期、计算时间范围等
 */

/**
 * 格式化日期为 yyyy-MM-dd
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取指定天数前的日期
 * @param {number} days - 天数
 * @returns {Date} 日期对象
 */
export function getDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * 根据时间范围获取开始和结束日期
 * @param {string} timeframe - 时间范围 (15M/1H/4H/1D/1W/1M)
 * @returns {object} {start, end} 日期字符串
 */
export function getDateRangeByTimeframe(timeframe) {
  const end = new Date();
  let start = new Date();

  switch (timeframe) {
    case '15M':
    case '1H':
    case '4H':
      start.setHours(start.getHours() - 24); // 1天
      break;
    case '1D':
      start.setDate(start.getDate() - 7); // 7天
      break;
    case '1W':
      start.setDate(start.getDate() - 30); // 30天
      break;
    case '1M':
      start.setDate(start.getDate() - 90); // 90天
      break;
    default:
      start.setDate(start.getDate() - 7); // 默认7天
  }

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

/**
 * 格式化时间戳为可读日期时间
 * @param {number} timestamp - Unix时间戳（秒）
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
}
