import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

export const useDashboardData = (groupId) => {
  const [data, setData] = useState({
    summary: null,
    leaderboard: null,
    demographics: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [groupId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [summary, leaderboard, demographics] = await Promise.all([
        dashboardAPI.getSummary(groupId),
        dashboardAPI.getLeaderboard(groupId),
        dashboardAPI.getDemographics(groupId)
      ]);
      
      setData({ summary, leaderboard, demographics });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchAllData };
};