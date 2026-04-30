import React from 'react';

// ============ KPI 卡片子組件 ============
const KPICard = ({ title, value, subtitle, icon: Icon, color, progress }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {subtitle && (
        <p className="text-sm text-blue-400 mb-2">{subtitle}</p>
      )}
      
      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress to Goal</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICard;
