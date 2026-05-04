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
        ${WC.t('section_analytics')}
      </div>
    </div>

    <!-- 年齡區間分布 -->
    <div class="chart-card">
      <h3 class="chart-title">${WC.t('chart_age_title')}</h3>
      <div style="position:relative;height:280px;">
        <canvas id="chart-age"></canvas>
      </div>
      <p style="${axisStyle}">${WC.t('chart_age_axis')}</p>
    </div>

    <!-- 運動時長分布 -->
    <div class="chart-card">
      <h3 class="chart-title">${WC.t('chart_duration_title')}</h3>
      <div style="position:relative;height:280px;">
        <canvas id="chart-duration"></canvas>
      </div>
      <p style="${axisStyle}">${WC.t('chart_duration_axis')}</p>
    </div>

    <!-- 運動時段分布 -->
    <div class="chart-card">
      <h3 class="chart-title">${WC.t('chart_time_title')}</h3>
      <div style="position:relative;height:280px;">
        <canvas id="chart-time"></canvas>
      </div>
      <p style="${axisStyle}">${WC.t('chart_time_axis')}</p>
    </div>

    <!-- 前50%參與者平均每人累積公里數 -->
    <div class="chart-card">
      <h3 class="chart-title">${WC.t('chart_weekly_title')}</h3>
      <div style="position:relative;height:280px;">
        <canvas id="chart-weekly"></canvas>
      </div>
      <p style="${axisStyle}">${WC.t('chart_weekly_axis').replace(/\\n/g, '<br>')}</p>
    </div>
  `;

  /* 依序渲染各圖表 */
  renderGroupedBar(
    'chart-age',
    cfg.AGE_LABELS,
    buildDatasets(groups, 'age_distribution', cfg.AGE_LABELS),
    WC.t('tooltip_unit_person')
  );

  renderGroupedBar(
    'chart-duration',
    cfg.DURATION_LABELS,
    buildDatasets(groups, 'duration_distribution', cfg.DURATION_LABELS),
    WC.t('tooltip_unit_session')
  );

  renderGroupedBar(
    'chart-time',
    cfg.TIME_LABELS,
    buildDatasets(groups, 'time_distribution', cfg.TIME_LABELS),
    WC.t('tooltip_unit_session')
  );

  renderTop50AvgKm(groups);
};

/* ── 內部函式 ────────────────────────────────────────────── */

/* 為指定的分布欄位建立三組 datasets */
function buildDatasets(groups, labelKey, labels) {
  const cfg = WC.config;
  // 永遠用中文 key 去查 JSON，與顯示語言無關
  const zhLabels = WC.TRANSLATIONS['zh'][
    labelKey === 'age_distribution'      ? 'age_labels'      :
    labelKey === 'duration_distribution' ? 'duration_labels' :
                                           'time_labels'
  ];

  return cfg.GROUP_ORDER.map(gid => {
    const g = groups[gid];
    return {
      label: WC.t('group_' + gid),
      data: zhLabels.map(zhKey => (g[labelKey] && g[labelKey][zhKey]) || 0),
      backgroundColor: g.color + 'cc',
      borderColor: g.color,
      borderWidth: 1,
      borderRadius: 3
    };
  });
}

/* 渲染分組長條圖 */
function renderGroupedBar(canvasId, labels, datasets, unit) {
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
  const weekLabels = Array.from(
    { length: maxWeeks },
    (_, i) => WC.t('week_label', { n: i + 1 })
  );

  const datasets = cfg.GROUP_ORDER.map(gid => {
    const g = groups[gid];
    return {
      label: WC.t('group_' + gid),
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

  const kmSuffix = WC.t('tooltip_km_suffix');
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
            label: ctx => ` ${ctx.dataset.label}: ${fmtKm(ctx.parsed.y)} km ${kmSuffix}`
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
