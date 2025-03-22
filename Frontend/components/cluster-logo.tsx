
import React from 'react';

export const ClusterLogo = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="6" fill="white" />
          <circle cx="28" cy="12" r="6" fill="white" />
          <circle cx="12" cy="28" r="6" fill="white" />
          <circle cx="28" cy="28" r="6" fill="white" />
          <circle cx="20" cy="20" r="5" fill="white" />
        </svg>
      </div>
      <span className="text-white font-bold text-2xl monument-font">Cluster</span>
    </div>
  );
};

export const DefiLogo = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="20" r="6" fill="white" />
          <circle cx="28" cy="20" r="6" fill="white" />
          <circle cx="20" cy="28" r="6" fill="white" />
          <circle cx="20" cy="12" r="6" fill="white" />
        </svg>
      </div>
      <span className="text-white font-bold text-2xl monument-font">Defi</span>
    </div>
  );
};
