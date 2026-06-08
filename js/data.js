/* ── 資料載入模組 ───────────────────────────────────────── */
window.WC = window.WC || {};

/**
 * 載入 dashboard_data.json，管理載入／錯誤 DOM 狀態
 * @param {Function} onSuccess - 成功時回呼，傳入解析後的 data 物件
 * @param {Function} [onError]  - 失敗時回呼（可選）
 */
WC.loadData = async function(onSuccess, onError) {
  try {
    const res = await fetch('../data/dashboard_data.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    onSuccess(data);
  } catch (err) {
    /* 隱藏載入畫面，顯示錯誤面板 */
    const loadingEl = document.getElementById('loading');
    const errorEl   = document.getElementById('error');
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) {
      errorEl.classList.remove('hidden');
      errorEl.classList.add('flex');
    }
    if (typeof onError === 'function') onError(err);
  }
};
