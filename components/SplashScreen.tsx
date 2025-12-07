
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#2DBE6C] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center animate-scale-up">
        
        {/* App Name */}
        <h1 className="text-5xl font-black text-white tracking-tight mb-2 drop-shadow-md">
          VegHaat
        </h1>
        
        {/* Tagline */}
        <p className="text-green-50 font-medium text-sm tracking-widest uppercase border-t border-green-400/30 pt-3 mt-1 opacity-90">
          Your Trusted Grocery Partner
        </p>
      </div>

      {/* Animated Loader Dots at Bottom */}
      <div className="absolute bottom-16 flex flex-col items-center">
         <div className="flex space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-white/80 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.3s' }}></div>
         </div>
      </div>
    </div>
  );
};

export default SplashScreen;