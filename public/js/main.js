/* ── 入口點：等待 DOM 就緒後啟動資料載入 ────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  WC.loadData(
    /* 成功回呼：依序渲染各區塊，最後顯示主內容 */
    function(data) {
      /* 更新頁首時間戳記 */
      const tsEl = document.getElementById('last-updated');
      if (tsEl && data.last_updated) {
        tsEl.textContent = '資料更新：' + data.last_updated;
      }

      WC.renderSummaryBar(data.groups);
      WC.renderCards(data.groups);
      WC.renderCharts(data.groups);

      /* 隱藏載入動畫，顯示主內容 */
      const loadingEl = document.getElementById('loading');
      const appEl     = document.getElementById('app');
      if (loadingEl) loadingEl.classList.add('hidden');
      if (appEl)     appEl.classList.remove('hidden');
    }
    /* 錯誤由 WC.loadData 內部處理，無需額外回呼 */
  );
});
