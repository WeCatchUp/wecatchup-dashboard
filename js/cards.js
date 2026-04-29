/* ── KPI 群組卡片渲染模組 ────────────────────────────────── */
window.WC = window.WC || {};

/**
 * 渲染三個群組的 KPI 卡片
 * @param {Object} groups - dashboard_data.json 中的 groups 物件
 */
WC.renderCards = function(groups) {
  const cfg       = WC.config;
  const container = document.getElementById('kpi-cards');
  container.innerHTML = '';

  cfg.GROUP_ORDER.forEach(gid => {
    const g = groups[gid];

    const achieveRate = g.achievement_rate != null ? g.achievement_rate : 0;

    /* 報名目標達成率 */
    const regTarget = g.registration_target || cfg.GROUP_TARGETS[gid] || 0;
    const regPct = regTarget > 0
      ? Math.min(100, (g.registrations / regTarget) * 100)
      : 0;

    /* 心率裝置用戶佔比 */
    const hrPct = g.registrations > 0
      ? Math.round(((g.users_with_hr || 0) / g.registrations) * 100)
      : 0;

    const card = document.createElement('div');
    card.className = 'group-card';

    card.innerHTML = `
      <div class="group-card-top-strip" style="background-color:${g.color}"></div>
      <div class="group-card-body">
        <!-- 標題列 -->
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.75rem;">${cfg.GROUP_ICONS[gid]}</span>
          <div style="flex:1;min-width:0;">
            <h2 style="margin:0;font-size:1rem;font-weight:700;color:var(--foreground);
                       white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${g.name}
            </h2>
            <span style="font-size:11px;color:var(--muted-foreground);">
              個人目標 ${g.goal_km}km・週目標 ${g.weekly_goal_km}km
            </span>
          </div>
          <span class="rate-badge" style="background-color:${g.color};flex-shrink:0;">
            ${achieveRate}% 達標
          </span>
        </div>

        <!-- 三格統計 -->
        <div class="kpi-stats-grid">
          <div class="stat-box">
            <p class="stat-box-value">
              <span style="font-size:1.75rem;font-weight:900;color:inherit;">${fmtNum(g.registrations)}</span>
              <span style="font-size:1rem;font-weight:500;color:var(--muted-foreground);">/${fmtNum(regTarget)}</span>
            </p>
            <p class="stat-box-label" style="margin-top:4px;">報名人數</p>
          </div>
          <div class="stat-box">
            <p class="stat-box-value">
              <span style="font-size:1.75rem;font-weight:900;color:inherit;">${fmtNum(g.active_participants)}</span>
              <span style="font-size:1rem;font-weight:500;color:var(--muted-foreground);">/${fmtNum(g.registrations)}</span>
            </p>
            <p class="stat-box-label" style="margin-top:4px;">運動人數</p>
          </div>
          <div class="stat-box-achieve"
               style="background-color:${g.color}10;border:1px solid ${g.color}30;">
            <p class="stat-box-value">
              <span style="font-size:1.75rem;font-weight:900;color:${g.color};">${fmtNum(g.achievers)}</span>
              <span style="font-size:1rem;font-weight:500;color:var(--muted-foreground);">/${fmtNum(g.registrations)}</span>
            </p>
            <p class="stat-box-label" style="margin-top:4px;">達標人數</p>
            <span class="achieve-badge" style="background-color:${g.color};">${achieveRate}%</span>
          </div>
        </div>

        <!-- 報名目標進度條 -->
        <div class="progress-section">
          <div style="display:flex;justify-content:space-between;font-size:12px;
                      color:var(--muted-foreground);margin-bottom:6px;">
            <span style="font-weight:500;">報名目標達成</span>
            <span>${fmtNum(g.registrations)} / ${fmtNum(regTarget)} 人</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill"
                 style="width:0%;background-color:${g.color}"
                 data-target-width="${regPct.toFixed(1)}%">
            </div>
          </div>
          <p style="text-align:right;font-size:12px;font-weight:700;
                    margin-top:4px;color:${g.color};">
            ${regPct.toFixed(1)}%
          </p>
        </div>

        <!-- 心率裝置用戶進度條 -->
        <div class="progress-section" style="margin-top:12px;">
          <div style="display:flex;justify-content:space-between;font-size:12px;
                      color:var(--muted-foreground);margin-bottom:6px;">
            <span style="font-weight:500;">心率裝置用戶</span>
            <span>${fmtNum(g.users_with_hr || 0)} 人（佔 ${hrPct}%）・達標 ${fmtNum(g.hr_achievers || 0)} 人</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill"
                 style="width:0%;background-color:#8b5cf6"
                 data-target-width="${hrPct}%">
            </div>
          </div>
        </div>

      </div>
    `;

    container.appendChild(card);
  });

  /* 延遲 100ms 後觸發進度條動畫（讓 CSS transition 有時間生效） */
  setTimeout(() => {
    document.querySelectorAll('.progress-fill').forEach(el => {
      el.style.width = el.dataset.targetWidth;
    });
  }, 100);
};

/* ── 數字格式化（供本模組內部使用） ─────────────────────── */
function fmtNum(n) {
  return (n || 0).toLocaleString('zh-TW');
}
function fmtKm(n) {
  return (n || 0).toLocaleString('zh-TW', { maximumFractionDigits: 1 });
}
