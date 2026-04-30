/* ── 圖表渲染模組 ───────────────────────────────────────── */
window.WC = window.WC || {};

/**
 * 渲染四張分析圖表，注入至 #charts-grid
 * @param {Object} groups - dashboard_data.json 中的 groups 物件
 */
WC.renderCharts = function(groups) {
  const cfg       = WC.config;
  const container = document.getElementById('charts-grid');

  const axisStyle = 'font-size:11px;color:var(--muted-foreground);margin-top:8px;line-height:1.6;border-top:1px solid #F0F0F0;padding-top:8px;';

  /* 插入區段標籤與四張圖表卡片的骨架 */
  container.innerHTML = `
    <div class="section-header" style="grid-column:1/-1;">
      <div class="section-label">
        <span class="section-label-dot"></span>
        數據分析
      </div>
    </div>

    <!-- 年齡區間分布 -->
    <div class="chart-card">
      <h3 class="chart-title">年齡區間分布（人數）</h3>
      <div style="position:relative;height:280px;">
        <canvas id="chart-age"></canvas>
      </div>
      <p style="${axisStyle}">
        X 軸：年齡區間 ｜ Y 軸：人數（人）。數值越高代表該年齡層運動頻率越高。
      </p>
    </div>

    <!-- 運動時長分布 -->
    <div class="chart-card">
      <h3 class="chart-title">運動時長分布</h3>
      <div style="position:relative;height:280px;">
        <canvas id="chart-duration"></canvas>
      </div>
      <p style="${axisStyle}">
        X 軸：單次運動時長 ｜ Y 軸：運動次數（筆）。可觀察成員最常見的運動時長區間。
      </p>
    </div>

    <!-- 運動時段分布 -->
    <div class="chart-card">
      <h3 class="chart-title">運動時段分布</h3>
      <div style="position:relative;height:280px;">
        <canvas id="chart-time"></canvas>
      </div>
      <p style="${axisStyle}">
        X 軸：一天中的時段 ｜ Y 軸：運動次數（筆）。可觀察成員最常運動的時間段，作為未來活動宣傳的參考。
      </p>
    </div>

    <!-- 前50%參與者平均每人累積公里數 -->
    <div class="chart-card">
      <h3 class="chart-title">前 50% 參與者・平均每人累積公里數</h3>
      <div style="position:relative;height:280px;">
        <canvas id="chart-weekly"></canvas>
      </div>
      <p style="${axisStyle}">
        📊 各團取累積里程前 50% 的參與者，計算其平均每人每週累積公里數。<br>
        數值越高代表活躍用戶投入程度越強，可作為下一期活動目標設定參考。
      </p>
    </div>
  `;

  /* 依序渲染各圖表 */
  renderGroupedBar(
    'chart-age',
    cfg.AGE_LABELS,
    buildDatasets(groups, 'age_distribution', cfg.AGE_LABELS),
    '人'  // 年齡分布以人數計
  );

  renderGroupedBar(
    'chart-duration',
    cfg.DURATION_LABELS,
    buildDatasets(groups, 'duration_distribution', cfg.DURATION_LABELS)
  );

  renderGroupedBar(
    'chart-time',
    cfg.TIME_LABELS,
    buildDatasets(groups, 'time_distribution', cfg.TIME_LABELS)
  );

  renderTop50AvgKm(groups);
};

/* ── 內部函式 ────────────────────────────────────────────── */

/* 為指定的分布欄位建立三組 datasets */
function buildDatasets(groups, labelKey, labels) {
  const cfg = WC.config;
  return cfg.GROUP_ORDER.map(gid => {
    const g = groups[gid];
    return {
      label: cfg.GROUP_NAMES_SHORT[gid],
      data: labels.map(l => (g[labelKey] && g[labelKey][l]) || 0),
      backgroundColor: g.color + 'cc',
      borderColor: g.color,
      borderWidth: 1,
      borderRadius: 3
    };
  });
}

/* 渲染分組長條圖
 * @param {string} canvasId
 * @param {string[]} labels
 * @param {Object[]} datasets
 * @param {string} [unit='次'] - tooltip 單位，年齡分布傳入 '人'
 */
function renderGroupedBar(canvasId, labels, datasets, unit = '次') {
  const cfg = WC.config;
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      ...cfg.CHART_DEFAULTS,
      plugins: {
        ...cfg.CHART_DEFAULTS.plugins,
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmtNum(ctx.parsed.y)} ${unit}`
          }
        }
      }
    }
  });
}

/* 渲染前50%參與者人均累積公里數折線圖 */
function renderTop50AvgKm(groups) {
  const cfg = WC.config;

  const maxWeeks = Math.max(
    ...cfg.GROUP_ORDER.map(gid => (groups[gid].top50_weekly_avg_km || []).length),
    1
  );
  const weekLabels = Array.from({ length: maxWeeks }, (_, i) => `第 ${i + 1} 週`);

  const datasets = cfg.GROUP_ORDER.map(gid => {
    const g = groups[gid];
    return {
      label: cfg.GROUP_NAMES_SHORT[gid],
      data: g.top50_weekly_avg_km || [],
      borderColor: g.color,
      backgroundColor: g.color + '22',
      borderWidth: 2.5,
      pointBackgroundColor: g.color,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.35,
      fill: false
    };
  });

  const ctx = document.getElementById('chart-weekly').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: { labels: weekLabels, datasets },
    options: {
      ...cfg.CHART_DEFAULTS,
      plugins: {
        ...cfg.CHART_DEFAULTS.plugins,
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmtKm(ctx.parsed.y)} km（人均累積）`
          }
        }
      },
      scales: {
        ...cfg.CHART_DEFAULTS.scales,
        y: {
          ...cfg.CHART_DEFAULTS.scales.y,
          ticks: {
            font: { size: 11 },
            callback: v => fmtKm(v) + ' km'
          }
        }
      }
    }
  });
}

/* ── 數字格式化（供本模組內部使用） ─────────────────────── */
function fmtNum(n) {
  return (n || 0).toLocaleString('zh-TW');
}
function fmtKm(n) {
  return (n || 0).toLocaleString('zh-TW', { maximumFractionDigits: 1 });
}