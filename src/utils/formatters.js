// 格式化數字為千位分隔符
export const formatNumber = (num) => {
  if (!num && num !== 0) return '-';
  return num.toLocaleString('en-US');
};

// 格式化百分比
export const formatPercentage = (num, decimals = 0) => {
  if (!num && num !== 0) return '-';
  return `${(num * 100).toFixed(decimals)}%`;
};

// 格式化日期
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '-';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  const formats = {
    'YYYY-MM-DD': `${year}-${month}-${day}`,
    'MMM DD, YYYY': `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${day}, ${year}`,
    'HH:mm': `${hours}:${minutes}`,
    'YYYY-MM-DD HH:mm': `${year}-${month}-${day} ${hours}:${minutes}`,
  };

  return formats[format] || date;
};

// 格式化時間 (例如："2h 30m")
export const formatDuration = (seconds) => {
  if (!seconds) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// 格式化大文件大小
export const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// 格式化活動率
export const formatActivityRate = (rate) => {
  if (!rate && rate !== 0) return '-';
  return `${rate.toFixed(0)}%`;
};

// 截斷長文本
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
