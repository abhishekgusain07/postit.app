import React from 'react';

export const YoutubeConnectSkeleton: React.FC = () => (
  <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-8 py-5 w-full max-w-2xl mx-auto gap-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="rounded-lg bg-gray-200 shadow-sm w-11 h-11" />
      <div className="flex flex-col gap-2">
        <div className="h-5 w-40 bg-gray-200 rounded" />
        <div className="h-4 w-28 bg-gray-100 rounded" />
      </div>
    </div>
    <div className="h-10 w-40 bg-gray-200 rounded-full" />
  </div>
);

export default YoutubeConnectSkeleton; 