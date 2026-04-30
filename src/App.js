import React, { useState, useEffect } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const [loading, setLoading] = useState(true);
  const [groupId] = useState(process.env.REACT_APP_GROUP_ID || 'default-group');

  useEffect(() => {
    // 模擬初始化加載
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Dashboard groupId={groupId} />
    </div>
  );
}

export default App;
