/* ── 全域命名空間初始化 ─────────────────────────────────── */
window.WC = window.WC || {};

/* ── 儀表板常數設定 ─────────────────────────────────────── */
WC.config = {
  /* 群組顯示順序 */
  GROUP_ORDER: ['run', 'bike', 'walk'],

  /* 各群組報名目標人數 */
  GROUP_TARGETS: { run: 550, bike: 375, walk: 625 },

  /* 各群組 emoji 圖示 */
  GROUP_ICONS: { run: '🏃', bike: '🚴', walk: '🚶' },

  /**
   * 各群組短名稱 — 由 i18n 動態取得，保留此 getter 供向下相容
   * 直接使用請改呼叫 WC.t('group_run') / WC.t('group_bike') / WC.t('group_walk')
   */
  get GROUP_NAMES_SHORT() {
    return {
      run:  WC.t ? WC.t('group_run')  : '慢跑',
      bike: WC.t ? WC.t('group_bike') : '單車',
      walk: WC.t ? WC.t('group_walk') : '健走'
    };
  },

  /* 各群組進度條淺色（漸層起點） */
  GROUP_PROGRESS_LIGHT: {
    run: '#93c5fd',
    bike: '#fdba74',
    walk: '#86efac'
  },

  /**
   * 年齡區間標籤 — 由 i18n 動態取得
   */
  get AGE_LABELS()      { return WC.tArr ? WC.tArr('age_labels')      : ['21-30','31-40','41-50','51-60','61-70','70+']; },
  get DURATION_LABELS() { return WC.tArr ? WC.tArr('duration_labels') : ['1-15分','16-30分','31-45分','46-60分','61-90分','91-120分','121-180分','180分+']; },
  get TIME_LABELS()     { return WC.tArr ? WC.tArr('time_labels')     : ['00-04時','04-08時','08-12時','12-16時','16-20時','20-24時']; },

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
