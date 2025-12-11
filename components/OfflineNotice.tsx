
import React from 'react';
import { WifiOff } from 'lucide-react';

const OfflineNotice: React.FC = () => {
  return (
    <div className="bg-gray-900 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center space-x-2 animate-fade-in fixed top-0 w-full z-[1000] max-w-[480px] left-1/2 -translate-x-1/2">
      <WifiOff size={14} />
      <span>You are offline. Showing cached content.</span>
    </div>
  );
};

export default OfflineNotice;
