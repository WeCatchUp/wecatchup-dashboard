/* ── 國際化字典與切換模組 ───────────────────────────────── */
window.WC = window.WC || {};

/* ── 字典定義 ────────────────────────────────────────────── */
WC.TRANSLATIONS = {
  zh: {
    /* ── 頁面載入 / 錯誤 ── */
    loading_text:           '載入資料中...',
    error_title:            '無法載入資料',
    error_desc:             '找不到 data/dashboard_data.json，請先執行更新腳本，再用本機伺服器開啟頁面。',
    error_step1:            '# 1. 更新資料',
    error_step2:            '# 2. 啟動本機伺服器（在專案根目錄）',
    error_step3:            '# 3. 開啟瀏覽器',

    /* ── 頁首 ── */
    header_badge:           '運動戰情看板',
    dashboard_title_prefix: 'WeCatchUp ',
    dashboard_title_team:   '第四團',
    dashboard_title_suffix: '戰情看板',
    activity_period:        '活動期間 2026/04/27 – 2026/07/05（共 10 週）',
    last_updated_prefix:    '資料更新：',

    /* ── 區段標籤 ── */
    section_overview:       '整體概覽',
    section_teams:          '各團表現',
    section_analytics:      '數據分析',

    /* ── 摘要統計列 ── */
    stat_total_reg:         '總報名人數',
    stat_total_reg_sub:     '三團合計',
    stat_active:            '活躍運動人數',
    stat_active_sub:        '活躍率 {pct}%',
    stat_achieve:           '整體達標率',
    stat_achieve_sub:       '加權平均',
    stat_leader:            '領先群組',
    stat_leader_sub:        '達標率 {rate}%',

    /* ── KPI 卡片 ── */
    card_goal:              '個人目標 {goal}km・週目標 {weekly}km',
    card_achieve_badge:     '{rate}% 達標',
    card_registered:        '報名人數',
    card_active:            '運動人數',
    card_achievers:         '達標人數',
    card_reg_progress:      '報名目標達成',
    card_hr_users:          '心率裝置用戶',
    card_hr_detail:         '{count} 人（佔 {pct}%）・達標 {achievers} 人',

    /* ── 各群組名稱 ── */
    group_run:              '慢跑',
    group_bike:             '單車',
    group_walk:             '健走',

    /* ── 圖表標題 ── */
    chart_age_title:        '年齡區間分布（人數）',
    chart_duration_title:   '運動時長分布',
    chart_time_title:       '運動時段分布',
    chart_weekly_title:     '前 50% 參與者・平均每人累積公里數',

    /* ── 圖表軸說明 ── */
    chart_age_axis:         'X 軸：年齡區間 ｜ Y 軸：人數（人）。數值越高代表該年齡層運動頻率越高。',
    chart_duration_axis:    'X 軸：單次運動時長 ｜ Y 軸：運動次數（筆）。可觀察成員最常見的運動時長區間。',
    chart_time_axis:        'X 軸：一天中的時段 ｜ Y 軸：運動次數（筆）。可觀察成員最常運動的時間段，作為未來活動宣傳的參考。',
    chart_weekly_axis:      '📊 各團取累積里程前 50% 的參與者，計算其平均每人每週累積公里數。\n數值越高代表活躍用戶投入程度越強，可作為下一期活動目標設定參考。',

    /* ── 圖表 tooltip ── */
    tooltip_unit_person:    '人',
    tooltip_unit_session:   '次',
    tooltip_km_suffix:      '（人均累積）',

    /* ── 圖表 X 軸標籤 ── */
    age_labels:     ['21-30', '31-40', '41-50', '51-60', '61-70', '70+'],
    duration_labels: ['1-15分', '16-30分', '31-45分', '46-60分', '61-90分', '91-120分', '121-180分', '180分+'],
    time_labels:    ['00-04時', '04-08時', '08-12時', '12-16時', '16-20時', '20-24時'],
    week_label:     '第 {n} 週',

    /* ── 頁尾 ── */
    footer:                 'WeCatchUp 第四團 · 資料來源：JoiiSport',

    /* ── 語言切換按鈕 ── */
    lang_toggle:            'EN'
  },

  en: {
    /* ── 頁面載入 / 錯誤 ── */
    loading_text:           'Loading data...',
    error_title:            'Failed to Load Data',
    error_desc:             'Cannot find data/dashboard_data.json. Please run the update script first, then open the page with a local server.',
    error_step1:            '# 1. Update data',
    error_step2:            '# 2. Start local server (from project root)',
    error_step3:            '# 3. Open browser',

    /* ── 頁首 ── */
    header_badge:           'Sports Dashboard',
    dashboard_title_prefix: 'WeCatchUp ',
    dashboard_title_team:   'Team 4',
    dashboard_title_suffix: ' Dashboard',
    activity_period:        'Activity Period: Apr 27 – Jul 5, 2026 (10 Weeks)',
    last_updated_prefix:    'Updated: ',

    /* ── 區段標籤 ── */
    section_overview:       'Overview',
    section_teams:          'Team Performance',
    section_analytics:      'Analytics',

    /* ── 摘要統計列 ── */
    stat_total_reg:         'Total Registered',
    stat_total_reg_sub:     'All 3 Teams',
    stat_active:            'Active Athletes',
    stat_active_sub:        'Activity Rate {pct}%',
    stat_achieve:           'Overall Goal Rate',
    stat_achieve_sub:       'Weighted Average',
    stat_leader:            'Leading Team',
    stat_leader_sub:        'Goal Rate {rate}%',

    /* ── KPI 卡片 ── */
    card_goal:              'Personal Goal {goal}km · Weekly {weekly}km',
    card_achieve_badge:     '{rate}% Achieved',
    card_registered:        'Registered',
    card_active:            'Active',
    card_achievers:         'Achieved',
    card_reg_progress:      'Registration Goal',
    card_hr_users:          'HR Device Users',
    card_hr_detail:         '{count} ({pct}%) · Goal {achievers}',

    /* ── 各群組名稱 ── */
    group_run:              'Running',
    group_bike:             'Cycling',
    group_walk:             'Walking',

    /* ── 圖表標題 ── */
    chart_age_title:        'Age Distribution (Members)',
    chart_duration_title:   'Session Duration Distribution',
    chart_time_title:       'Exercise Time-of-Day Distribution',
    chart_weekly_title:     'Top 50% Participants · Avg. Cumulative km/Person',

    /* ── 圖表軸說明 ── */
    chart_age_axis:         'X: Age Group | Y: Members. Higher values indicate more frequent exercisers in that age group.',
    chart_duration_axis:    'X: Session Duration | Y: Sessions. Shows the most common workout durations across members.',
    chart_time_axis:        'X: Time of Day | Y: Sessions. Reveals when members most commonly exercise — useful for planning promotions.',
    chart_weekly_axis:      '📊 Top 50% participants by cumulative distance per team, averaged per person per week.\nHigher values indicate stronger engagement — useful as a benchmark for next round\'s goals.',

    /* ── 圖表 tooltip ── */
    tooltip_unit_person:    'members',
    tooltip_unit_session:   'sessions',
    tooltip_km_suffix:      '(avg. cumulative)',

    /* ── 圖表 X 軸標籤 ── */
    age_labels:     ['21-30', '31-40', '41-50', '51-60', '61-70', '70+'],
    duration_labels: ['1-15min', '16-30min', '31-45min', '46-60min', '61-90min', '91-120min', '121-180min', '180min+'],
    time_labels:    ['00-04h', '04-08h', '08-12h', '12-16h', '16-20h', '20-24h'],
    week_label:     'Wk {n}',

    /* ── 頁尾 ── */
    footer:                 'WeCatchUp Team 4 · Data Source: JoiiSport',

    /* ── 語言切換按鈕 ── */
    lang_toggle:            '中'
  }
};

/* ── 目前語言狀態 ────────────────────────────────────────── */
WC.currentLang = 'zh';

/**
 * 取得翻譯字串，支援 {placeholder} 插值
 * @param {string} key
 * @param {Object} [vars] - 插值變數，例如 { pct: 78 }
 * @returns {string}
 */
WC.t = function(key, vars) {
  const dict = WC.TRANSLATIONS[WC.currentLang] || WC.TRANSLATIONS['zh'];
  let str = dict[key];
  if (str === undefined) {
    // fallback 到中文
    str = WC.TRANSLATIONS['zh'][key] || key;
  }
  if (vars) {
    Object.keys(vars).forEach(k => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), vars[k]);
    });
  }
  return str;
};

/**
 * 取得陣列型翻譯（如 age_labels）
 * @param {string} key
 * @returns {string[]}
 */
WC.tArr = function(key) {
  const dict = WC.TRANSLATIONS[WC.currentLang] || WC.TRANSLATIONS['zh'];
  return dict[key] || WC.TRANSLATIONS['zh'][key] || [];
};

/**
 * 切換語言並重新渲染整個儀表板
 * @param {string} lang - 'zh' | 'en'
 */
WC.setLanguage = function(lang) {
  if (!WC.TRANSLATIONS[lang]) return;
  WC.currentLang = lang;
  localStorage.setItem('wc_lang', lang);

  // 更新 html lang 屬性
  document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';

  // 更新切換按鈕文字
  const btn = document.getElementById('lang-toggle-btn');
  if (btn) btn.textContent = WC.t('lang_toggle');

  // 若資料已載入，重新渲染
  if (WC._lastData) {
    WC._rerender(WC._lastData);
  }
};

/**
 * 初始化語言（讀取 localStorage 或 URL 參數）
 */
WC.initLang = function() {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const saved   = localStorage.getItem('wc_lang');
  const lang    = (urlLang === 'en' || urlLang === 'zh') ? urlLang
                : (saved   === 'en' || saved   === 'zh') ? saved
                : 'zh';
  WC.currentLang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';
};
