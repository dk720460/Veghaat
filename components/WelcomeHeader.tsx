
import React from 'react';

const WelcomeHeader: React.FC = () => {
  return (
    <div className="w-full relative overflow-visible pt-4 pb-2 px-2 bg-white flex items-center justify-center min-h-[90px]">
        <div className="relative z-10 w-full max-w-[280px]">
            {/* SVG for Curved Text - Adjusted for ~20% bend */}
            <svg viewBox="0 0 300 80" className="w-full h-auto overflow-visible">
                {/* Quadratic Bezier Curve for gentle arch */}
                <path id="curve" d="M 30 60 Q 150 20 270 60" fill="transparent" />
                <text width="300">
                    <textPath 
                        href="#curve" 
                        startOffset="50%" 
                        textAnchor="middle" 
                        className="text-[38px] font-black fill-green-700 drop-shadow-sm" 
                        style={{ fontFamily: "'Lilita One', cursive", letterSpacing: '2px' }}
                    >
                        WELCOME
                    </textPath>
                </text>
            </svg>
            
            {/* Subtext */}
            <div className="text-center -mt-5">
                <p className="inline-block text-[10px] font-bold text-gray-500 tracking-wider uppercase bg-white/80 backdrop-blur-sm border border-white px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                    Order now & enjoy <span className="text-green-600">FREE delivery</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default WelcomeHeader;
