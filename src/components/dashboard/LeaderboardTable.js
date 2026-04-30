import React, { useState } from 'react';

// ============ 參與者排行榜表格 ============
const LeaderboardTable = ({ data, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-6">Participant Details</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-6">Participant Details</h3>
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">暫無參與者資料</p>
          <p className="text-gray-500 text-sm">數據正在同步中，請稍後再試</p>
        </div>
      </div>
    );
  }

  // 篩選資料
  const filteredData = data.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Participant Details</h3>
        <input
          type="text"
          placeholder="Search participants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 text-sm font-medium pb-3">ID</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Name</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Age</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Event</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Registration Date</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Status</th>
              <th className="text-left text-gray-400 text-sm font-medium pb-3">Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, 10).map((participant, index) => (
              <tr key={participant.email} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                <td className="py-4 text-gray-300">P{String(index + 1).padStart(3, '0')}</td>
                <td className="py-4 text-white font-medium">{participant.name || 'N/A'}</td>
                <td className="py-4 text-gray-300">{participant.age || 'N/A'}</td>
                <td className="py-4 text-gray-300">Money Walking</td>
                <td className="py-4 text-gray-300">{participant.registration_date || 'N/A'}</td>
                <td className="py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-900 text-green-300">
                    Active
                  </span>
                </td>
                <td className="py-4">
                  <span className="font-semibold text-green-400">
                    {participant.progress || 87}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredData.length === 0 && (
        <p className="text-gray-400 text-center py-8">沒有找到相符的參與者</p>
      )}
    </div>
  );
};

export default LeaderboardTable;
