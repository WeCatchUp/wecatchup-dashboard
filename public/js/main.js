/* ── 入口點：等待 DOM 就緒後啟動資料載入 ────────────────── */
document.addEventListener('DOMContentLoaded', function() {

  /* 初始化語言（讀 URL 參數或 localStorage） */
  WC.initLang();

  /* 注入語言切換按鈕至頁首 */
  const header = document.getElementById('dashboard-header');
  if (header) {
    const btn = document.createElement('button');
    btn.id        = 'lang-toggle-btn';
    btn.textContent = WC.t('lang_toggle');
    btn.title     = 'Switch Language';
    btn.style.cssText = [
      'padding:6px 14px',
      'border:1.5px solid var(--border)',
      'border-radius:999px',
      'background:var(--card)',
      'color:var(--foreground)',
      'font-size:13px',
      'font-weight:600',
      'cursor:pointer',
      'letter-spacing:0.03em',
      'transition:background 0.15s, border-color 0.15s',
      'flex-shrink:0',
      'align-self:flex-start',
      'margin-top:8px'
    ].join(';');

    btn.addEventListener('mouseenter', () => {
      btn.style.background    = 'var(--accent)';
      btn.style.borderColor   = 'var(--accent)';
      btn.style.color         = '#fff';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background    = 'var(--card)';
      btn.style.borderColor   = 'var(--border)';
      btn.style.color         = 'var(--foreground)';
    });

    btn.addEventListener('click', () => {
      WC.setLanguage(WC.currentLang === 'zh' ? 'en' : 'zh');
    });

    const tsEl = document.getElementById('last-updated');
    if (tsEl && tsEl.parentNode) {
      tsEl.parentNode.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;gap:8px;';
      tsEl.parentNode.insertBefore(btn, tsEl);
    }
  }

  WC.loadData(
    /* 成功回呼：依序渲染各區塊，最後顯示主內容 */
    function(data) {
      /* 儲存資料供語言切換時重新渲染使用 */
      WC._lastData = data;

      /* 定義重新渲染函式（語言切換時呼叫） */
      WC._rerender = function(d) {
        /* 更新頁首動態文字 */
        _updateHeader(d);
        /* 更新載入/錯誤畫面的靜態文字 */
        _updateStaticText();
        /* 重新渲染三大區塊 */
        WC.renderSummaryBar(d.groups);
        WC.renderCards(d.groups);
        /* charts-grid 需整個重建（含 canvas） */
        const chartsEl = document.getElementById('charts-grid');
        if (chartsEl) chartsEl.innerHTML = '';
        WC.renderCharts(d.groups);
        /* 更新區段標籤 */
        _updateSectionLabels();
        /* 更新頁尾 */
        _updateFooter();
      };

      /* 首次渲染 */
      _updateHeader(data);
      _updateStaticText();
      WC.renderSummaryBar(data.groups);
      WC.renderCards(data.groups);
      WC.renderCharts(data.groups);
      _updateSectionLabels();
      _updateFooter();

      /* 隱藏載入動畫，顯示主內容 */
      const loadingEl = document.getElementById('loading');
      const appEl     = document.getElementById('app');
      if (loadingEl) loadingEl.classList.add('hidden');
      if (appEl)     appEl.classList.remove('hidden');
    }
    /* 錯誤由 WC.loadData 內部處理 */
  );
});

/* ── 內部更新函式 ────────────────────────────────────────── */

function _updateHeader(data) {
  /* 頁首 badge */
  const badge = document.querySelector('#dashboard-header .section-label');
  if (badge) {
    badge.innerHTML = `<span class="section-label-dot"></span>${WC.t('header_badge')}`;
  }

  /* 標題 */
  const h1 = document.querySelector('#dashboard-header h1');
  if (h1) {
    h1.innerHTML = `${WC.t('dashboard_title_prefix')}<span class="gradient-text">${WC.t('dashboard_title_team')}</span>${WC.t('dashboard_title_suffix')}`;
  }

  /* 副標題（活動期間） */
  const subtitle = document.querySelector('#dashboard-header .dashboard-subtitle:not(#last-updated)');
  if (subtitle) subtitle.textContent = WC.t('activity_period');

  /* 資料更新時間 */
  const tsEl = document.getElementById('last-updated');
  if (tsEl && data && data.last_updated) {
    tsEl.textContent = WC.t('last_updated_prefix') + data.last_updated;
  }
}

function _updateStaticText() {
  /* 載入文字 */
  const loadingP = document.querySelector('#loading p');
  if (loadingP) loadingP.textContent = WC.t('loading_text');

  /* 錯誤標題 */
  const errTitle = document.querySelector('#error h2');
  if (errTitle) errTitle.textContent = WC.t('error_title');
}

function _updateSectionLabels() {
  /* 整體概覽 / 各團表現 兩個 section-header（#charts-grid 內的由 charts.js 處理） */
  const labels = document.querySelectorAll('.section-header .section-label');
  const keys   = ['section_overview', 'section_teams'];
  labels.forEach((el, i) => {
    if (keys[i]) {
      el.innerHTML = `<span class="section-label-dot"></span>${WC.t(keys[i])}`;
    }
  });
}

function _updateFooter() {
  const footer = document.getElementById('dashboard-footer');
  if (footer) footer.textContent = WC.t('footer');
}
