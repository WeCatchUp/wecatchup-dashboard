import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ============ 運動高峰時段圖表 ============
const PeakTimesChart = () => {
  const timeData = [
    { time: '02:00', participants: 15 },
    { time: '06:00', participants: 45 },
    { time: '10:00', participants: 78 },
    { time: '14:00', participants: 52 },
    { time: '18:00', participants: 112 },
    { time: '24:00', participants: 28 }
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-6">Exercise Peak Times</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={timeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: 'none',
              borderRadius: '8px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="participants" 
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-sm text-green-400 mt-4">
        <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
        Peak activity: 18:00 (112 participants)
      </p>
    </div>
  );
};

export default PeakTimesChart;
