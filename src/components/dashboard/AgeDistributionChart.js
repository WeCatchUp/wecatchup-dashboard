import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ============ 年齡分布圖表 ============
const AgeDistributionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg h-96 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-2">暫無年齡分布資料</p>
          <p className="text-gray-500 text-sm">使用模擬數據展示</p>
        </div>
      </div>
    );
  }

  const colors = ['#f97316', '#3b82f6', '#a855f7', '#10b981'];

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-6">Age Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="age_group" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <div>
              <p className="text-gray-400 text-xs">{item.age_group}</p>
              <p className="text-white font-semibold">{item.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgeDistributionChart;
