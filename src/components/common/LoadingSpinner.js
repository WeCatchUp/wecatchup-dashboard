import React from 'react';

const LoadingSpinner = ({ text = '載入中...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="text-gray-400 text-lg">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
