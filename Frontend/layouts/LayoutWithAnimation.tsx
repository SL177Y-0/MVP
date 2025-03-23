import React, { ReactNode } from 'react';

interface LayoutWithAnimationProps {
  mainContent: ReactNode;
  sideContent: ReactNode;
}

const LayoutWithAnimation: React.FC<LayoutWithAnimationProps> = ({ 
  mainContent, 
  sideContent 
}) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Side content - info panel */}
      <div className="lg:w-1/3 bg-gray-900/50 p-6 lg:p-8 lg:min-h-screen lg:max-h-screen lg:overflow-auto">
        {sideContent}
      </div>
      
      {/* Main content - visual elements and interactions */}
      <div className="lg:w-2/3 flex-1 bg-gray-900/30 p-6 lg:p-8 flex flex-col lg:min-h-screen lg:max-h-screen lg:overflow-auto">
        {mainContent}
      </div>
    </div>
  );
};

export default LayoutWithAnimation; 