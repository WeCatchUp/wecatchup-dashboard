// TODO: 實現請求超時機制，避免無限等待
// TODO: 添加請求攔截器記錄 API 調用時間用於性能監控
// TODO: 實現指數退避重試策略（處理網絡波動）
// TODO: 實現本地緩存層減少 API 調用（localStorage / IndexedDB，建議 5 分鐘過期）

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api/v1";

// TODO: 從環境變數驗證 API_BASE_URL，若為空在啟動時應報錯
if (!API_BASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: REACT_APP_API_URL 未設置，將使用相對路徑 /api/v1');
}

export const dashboardAPI = {
  // TODO: 實現通用的 fetchWithTimeout 函數
  getSummary: async (groupId) => {
    // TODO: 添加 Request ID 用於追蹤和日誌分析
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/summary`);
    if (!response.ok) throw new Error('Failed to fetch summary');
    return response.json();
  },
  
  getLeaderboard: async (groupId, limit = 100) => {
    // TODO: 實現分頁機制，當數據超過 1000 筆時使用遠程分頁
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}/leaderboard?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },
  
  getDemographics: async (groupId) => {
    // TODO: 考慮該端點是否需要分頁或懶加載
    const response = await fetch(`${API_BASE_URL}/analytics/demographics?group_id=${groupId}`);
    if (!response.ok) throw new Error('Failed to fetch demographics');
    return response.json();
  }
};