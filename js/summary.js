/* ── 摘要列渲染模組 ─────────────────────────────────────── */
window.WC = window.WC || {};

/**
 * 渲染頂部四格摘要統計列
 * @param {Object} groups - dashboard_data.json 中的 groups 物件
 */
WC.renderSummaryBar = function(groups) {
  const cfg = WC.config;

  /* 計算跨三團彙總數字 */
  const totalRegistrations = cfg.GROUP_ORDER.reduce(
    (s, gid) => s + (groups[gid].registrations || 0), 0
  );
  const totalActive = cfg.GROUP_ORDER.reduce(
    (s, gid) => s + (groups[gid].active_participants || 0), 0
  );
  const activePct = totalRegistrations > 0
    ? Math.round(totalActive / totalRegistrations * 100)
    : 0;

  /* 以淨報名人數加權計算整體達標率 */
  const totalNetReg = cfg.GROUP_ORDER.reduce(
    (s, gid) => s + (groups[gid].net_registrations || 0), 0
  );
  const weightedAchieve = cfg.GROUP_ORDER.reduce((s, gid) => {
    const g = groups[gid];
    return s + (g.achievement_rate || 0) * (g.net_registrations || 0);
  }, 0);
  const avgAchievement = totalNetReg > 0
    ? (weightedAchieve / totalNetReg).toFixed(1)
    : '0.0';

  /* 找出達標率最高的群組 */
  let topGid = cfg.GROUP_ORDER[0];
  cfg.GROUP_ORDER.forEach(gid => {
    if ((groups[gid].achievement_rate || 0) > (groups[topGid].achievement_rate || 0)) {
      topGid = gid;
    }
  });
  const topGroup = cfg.GROUP_NAMES_SHORT[topGid];
  const topRate  = groups[topGid].achievement_rate || 0;

  /* 四張統計卡片定義 */
  const cards = [
    {
      iconClass: 'solid-bg-purple',
      emoji: '👥',
      value: fmtNum(totalRegistrations),
      label: '總報名人數',
      sublabel: '三團合計',
      sublabelColor: '#6366f1'
    },
    {
      iconClass: 'solid-bg-green',
      emoji: '⚡',
      value: fmtNum(totalActive),
      label: '活躍運動人數',
      sublabel: `活躍率 ${activePct}%`,
      sublabelColor: '#22c55e'
    },
    {
      iconClass: 'solid-bg-orange',
      emoji: '🎯',
      value: `${avgAchievement}%`,
      label: '整體達標率',
      sublabel: '加權平均',
      sublabelColor: '#f97316'
    },
    {
      iconClass: 'solid-bg-blue',
      emoji: '🏆',
      value: topGroup,
      label: '領先群組',
      sublabel: `達標率 ${topRate}%`,
      sublabelColor: '#3b82f6'
    }
  ];

  const container = document.getElementById('summary-bar');
  container.innerHTML = cards.map(c => `
    <div class="stat-card card">
      <div>
        <div class="stat-icon ${c.iconClass}" style="margin-bottom:16px;">
          ${c.emoji}
        </div>
        <p class="stat-value">${c.value}</p>
        <p class="stat-label">${c.label}</p>
        <p class="stat-sublabel" style="color:${c.sublabelColor}">
          ${c.sublabel}
        </p>
      </div>
    </div>
  `).join('');
};

/* ── 數字格式化（供本模組內部使用） ─────────────────────── */
function fmtNum(n) {
  return (n || 0).toLocaleString('zh-TW');
}
