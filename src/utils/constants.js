// API 端點常數
export const API_ENDPOINTS = {
  SUMMARY: '/api/v1/groups/:groupId/summary',
  LEADERBOARD: '/api/v1/groups/:groupId/leaderboard',
  DEMOGRAPHICS: '/api/v1/analytics/demographics',
};

// 顏色常數
export const COLORS = {
  PRIMARY_BLUE: '#3b82f6',
  SECONDARY_PURPLE: '#a855f7',
  SUCCESS_GREEN: '#10b981',
  WARNING_ORANGE: '#f97316',
  DANGER_RED: '#ef4444',
  GRAY_800: '#1f2937',
  GRAY_700: '#374151',
  GRAY_600: '#4b5563',
  GRAY_400: '#9ca3af',
};

// 年齡段
export const AGE_GROUPS = [
  '18-30',
  '31-42',
  '41-60',
  '61-80',
];

// 運動類型
export const EXERCISE_TYPES = {
  WALKING: 'Walking',
  RUNNING: 'Running',
  CYCLING: 'Cycling',
};

// 時間範圍選項
export const TIME_RANGES = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'Last Year', value: '1y' },
];

// 狀態
export const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
};
