/* ── 全域命名空間初始化 ─────────────────────────────────── */
window.WC = window.WC || {};

/* ── 儀表板常數設定 ─────────────────────────────────────── */
WC.config = {
  /* 群組顯示順序 */
  GROUP_ORDER: ['run', 'bike', 'walk'],

  /* 各群組報名目標人數 */
  GROUP_TARGETS: { run: 500, bike: 500, walk: 500 },

  /* 各群組 emoji 圖示 */
  GROUP_ICONS: { run: '🏃', bike: '🚴', walk: '🚶' },

  /* 各群組中文短名稱 */
  GROUP_NAMES_SHORT: { run: '慢跑', bike: '單車', walk: '健走' },

  /* 各群組進度條淺色（漸層起點） */
  GROUP_PROGRESS_LIGHT: {
    run: '#93c5fd',
    bike: '#fdba74',
    walk: '#86efac'
  },

  /* 年齡區間標籤 */
  AGE_LABELS: ['21-30', '31-40', '41-50', '51-60', '61-70', '70+'],

  /* 運動時長區間標籤 */
  DURATION_LABELS: [
    '1-15分', '16-30分', '31-45分',
    '46-60分', '61-90分', '91-120分', '121-180分', '180分+'
  ],

  /* 運動時段標籤 */
  TIME_LABELS: [
    '00-04時', '04-08時', '08-12時',
    '12-16時', '16-20時', '20-24時'
  ],

  /* Chart.js 預設選項 */
  CHART_DEFAULTS: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          boxWidth: 12,
          padding: 12
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      },
      y: {
        grid: { color: '#f3f4f6' },
        ticks: { font: { size: 11 } },
        beginAtZero: true
      }
    }
  }
};
