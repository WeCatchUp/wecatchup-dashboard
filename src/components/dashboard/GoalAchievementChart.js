import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ============ 活動目標達成圖表 ============
const GoalAchievementChart = ({ groupName }) => {
  const mockData = [
    { activity: 'Walking', actual: 234, target: 260 },
    { activity: 'Running', actual: 180, target: 200 },
    { activity: 'Cycling', actual: 156, target: 180 }
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-6">Event Goal Achievement</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="activity" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar dataKey="actual" fill="#3B82F6" name="Actual Performance" radius={[8, 8, 0, 0]} />
          <Bar dataKey="target" fill="#93C5FD" name="Target Goal" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GoalAchievementChart;
