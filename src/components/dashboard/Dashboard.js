import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, Award, Clock } from 'lucide-react';
import KPICard from './KPICard';
import AgeDistributionChart from './AgeDistributionChart';
import GoalAchievementChart from './GoalAchievementChart';
import PeakTimesChart from './PeakTimesChart';
import LeaderboardTable from './LeaderboardTable';

// TODO: 提取 API 調用邏輯到自定義 Hook useApi() 或 useDashboardData()
// TODO: 實現加載骨架屏 (Skeleton Loading) 替代 "..." 加載指示器
// TODO: 移除所有 console.log，使用統一的日誌系統（如 winston 或 Sentry）
// TODO: 實現數據緩存機制（5 分鐘過期），減少不必要的 API 調用
// TODO: 根據不同的失敗原因展示不同的錯誤信息（網絡錯誤、API 錯誤、超時等）
// TODO: 實現重試機制，網絡波動時自動重試
// TODO: 添加遠程錯誤監控（Sentry / Rollbar）用於生產環境異常追蹤

// ============ 主組件：Dashboard ============
const Dashboard = ({ groupId = 'default-group' }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [demographicsData, setDemographicsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');

  // API 基礎 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || "/api/v1";
  const GROUP_ID = groupId || 'MoneyI_Target';

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    // TODO: 使用統一的日誌系統替代 console.log
    // TODO: 添加請求開始時間戳用於性能分析
    console.log('開始載入數據...');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('GROUP_ID:', GROUP_ID);

    try {
      // 並行請求三個 API（使用 Promise.allSettled 以容錯）
      // 注意：API_BASE_URL 已包含 /api/v1 前綴，路徑應統一格式
      const [summaryResult, leaderboardResult, demographicsResult] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/groups/${GROUP_ID}/summary`)
          .then(res => res.ok ? res.json() : null),
        fetch(`${API_BASE_URL}/groups/${GROUP_ID}/leaderboard?limit=100`)
          .then(res => res.ok ? res.json() : []),
        fetch(`${API_BASE_URL}/analytics/demographics?group_id=${GROUP_ID}`)
          .then(res => res.ok ? res.json() : null)
      ]);
      
      // 處理 Summary (必須成功)
      if (summaryResult.status === 'fulfilled' && summaryResult.value) {
        console.log('Summary 數據:', summaryResult.value);
        setSummaryData(summaryResult.value);
      } else {
        console.error('Summary API 失敗:', summaryResult);
        throw new Error('無法載入摘要數據');
      }

      // 處理 Leaderboard（可選，使用降級數據）
      if (leaderboardResult.status === 'fulfilled' && leaderboardResult.value) {
        const leaderboard = leaderboardResult.value;
        console.log('Leaderboard 數據筆數:', leaderboard.length);
        // 如果返回空數組，使用模擬數據
        setLeaderboardData(leaderboard.length > 0 ? leaderboard : getMockLeaderboard());
      } else {
        console.warn('Leaderboard API 失敗，使用模擬數據');
        setLeaderboardData(getMockLeaderboard());
      }

      // 處理 Demographics（可選，使用降級數據）
      if (demographicsResult.status === 'fulfilled' && demographicsResult.value) {
        console.log('Demographics 數據:', demographicsResult.value);
        setDemographicsData(demographicsResult.value);
      } else {
        console.warn('Demographics API 失敗，使用模擬數據');
        setDemographicsData(getMockDemographics());
      }
    } catch (err) {
      console.error('載入錯誤:', err);
      setError(err.message);
    } finally {
      console.log('數據載入完成');
      setLoading(false);
    }
  };

  // 模擬 Leaderboard 數據
  const getMockLeaderboard = () => [
    { email: 'user1@example.com', name: 'Sarah Johnson', age: 45, minutes: 2150, achieved: true, registration_date: '2025-12-15', progress: 92 },
    { email: 'user2@example.com', name: 'Michael Chen', age: 52, minutes: 1890, achieved: true, registration_date: '2025-12-18', progress: 87 },
    { email: 'user3@example.com', name: 'Emma Wilson', age: 38, minutes: 1720, achieved: false, registration_date: '2025-12-20', progress: 78 },
    { email: 'user4@example.com', name: 'David Lee', age: 61, minutes: 1650, achieved: false, registration_date: '2025-12-22', progress: 75 },
    { email: 'user5@example.com', name: 'Lisa Brown', age: 29, minutes: 1580, achieved: false, registration_date: '2025-12-25', progress: 72 },
  ];

  // 模擬 Demographics 數據
  const getMockDemographics = () => [
    { age_group: '18-30', count: 89, percentage: 0.18 },
    { age_group: '31-40', count: 142, percentage: 0.29 },
    { age_group: '41-60', count: 267, percentage: 0.44 },
    { age_group: '61+', count: 111, percentage: 0.09 },
  ];

  // 計算進度百分比
  const calculateProgress = () => {
    if (!summaryData) return 0;
    const { official_metrics } = summaryData;
    if (official_metrics?.reg_count === 0) return 0;
    return Math.round(((official_metrics?.goal_count || 0) / (official_metrics?.reg_count || 1)) * 100);
  };

  // 計算活躍率百分比
  const calculateActivityRate = () => {
    if (!summaryData) return 0;
    return Math.round((summaryData.db_active_metrics?.real_active_rate || 0) * 100);
  };

  // 找出核心受眾
  const getCoreAudience = () => {
    if (!demographicsData || demographicsData.length === 0) return 'Ages 41-60';
    const topDemographic = demographicsData[0];
    return topDemographic.age_group;
  };

  const getTopEventCount = () => {
    if (!summaryData) return 0;
    return summaryData.db_active_metrics?.active_users || 0;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 text-red-200 px-6 py-4 rounded-lg max-w-md">
          <h3 className="font-bold mb-2">載入錯誤</h3>
          <p>{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-red-700 hover:bg-red-600 px-4 py-2 rounded transition-colors"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* 標題區 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {summaryData?.name || 'Money Target 有效運動團'} KPI Dashboard
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last Updated: {new Date().toLocaleString()}
          </p>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* KPI 卡片區 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Registrations"
          value={loading ? '...' : summaryData?.official_metrics?.reg_count || 0}
          subtitle={`${calculateProgress()}% Activity Rate`}
          icon={Users}
          color="bg-blue-600"
          progress={calculateProgress()}
        />
        
        <KPICard
          title="Active Participants"
          value={loading ? '...' : summaryData?.db_active_metrics?.active_users || 0}
          subtitle={`${calculateActivityRate()}% Activity Rate`}
          icon={Activity}
          color="bg-green-600"
        />
        
        <KPICard
          title="Core Audience"
          value={getCoreAudience()}
          subtitle={`${Math.round((demographicsData?.[0]?.percentage || 0.44) * 100)}% of all participants`}
          icon={TrendingUp}
          color="bg-purple-600"
        />
        
        <KPICard
          title="Top Event"
          value="Money Walking"
          subtitle={`${getTopEventCount()} participants`}
          icon={Award}
          color="bg-orange-600"
        />
      </div>

      {/* 圖表區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AgeDistributionChart data={demographicsData} />
        <GoalAchievementChart groupName={summaryData?.name} />
      </div>

      <div className="mb-8">
        <PeakTimesChart />
      </div>

      {/* 參與者列表 */}
      <LeaderboardTable data={leaderboardData} loading={loading} />
    </div>
  );
};

export default Dashboard;