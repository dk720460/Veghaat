
import React from 'react';

const DeliveryAnimation: React.FC = () => {
  return (
    <div className="w-full bg-[#F5F7FD] py-4 overflow-hidden relative h-[100px] flex flex-col items-center justify-center transition-colors">
       {/* Road line */}
       <div className="absolute bottom-4 left-0 w-full h-1 bg-gray-300"></div>
       <div className="absolute bottom-4 left-0 w-full h-1 bg-dashed bg-gradient-to-r from-transparent via-gray-400 to-transparent opacity-50"></div>

       {/* Moving Bike Container */}
       <div className="absolute bottom-5 animate-bike flex items-end z-10">
          
          {/* Speed Lines */}
          <div className="flex flex-col space-y-1 mr-[-10px] mb-6 opacity-60 z-0 transform -translate-x-full">
             <div className="w-16 h-0.5 bg-gray-400 rounded-full animate-pulse"></div>
             <div className="w-24 h-0.5 bg-gray-400 rounded-full animate-pulse delay-75"></div>
             <div className="w-12 h-0.5 bg-gray-400 rounded-full animate-pulse delay-150"></div>
          </div>

          <div className="relative z-10 origin-bottom transform scale-[0.6]">
             {/* Realistic Indian Scooter SVG (e.g., Activa Style) */}
             <svg width="120" height="90" viewBox="0 0 150 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shadow */}
                <ellipse cx="75" cy="98" rx="45" ry="4" fill="black" opacity="0.2" />

                {/* Rear Wheel */}
                <circle cx="40" cy="90" r="14" fill="#1f2937" stroke="#111" strokeWidth="2"/>
                <circle cx="40" cy="90" r="9" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/>
                
                {/* Front Wheel */}
                <circle cx="115" cy="90" r="14" fill="#1f2937" stroke="#111" strokeWidth="2"/>
                <circle cx="115" cy="90" r="9" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/>
                
                {/* Main Body */}
                <path d="M120 70 L115 45 L95 45 L85 80 L50 80 L40 60 L25 60 Q 15 75 40 90 L 115 90" fill="#DC2626" stroke="#991b1b" strokeWidth="1"/>
                
                {/* Floorboard */}
                <path d="M45 82 L90 82 L95 75 L45 75 Z" fill="#374151" />

                {/* Seat */}
                <path d="M40 60 L85 60 L88 55 L38 52 Q 35 55 40 60" fill="#1f2937" stroke="#111" strokeWidth="1"/>
                
                {/* Front Panel */}
                <path d="M115 45 L118 25 L105 25 L110 45 Z" fill="#DC2626" />
                <path d="M115 25 L112 10" stroke="#1f2937" strokeWidth="4" />
                
                {/* Dashboard & Headlight */}
                <rect x="108" y="8" width="18" height="8" fill="#1f2937" rx="3" />
                <circle cx="117" cy="20" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                
                {/* Mirrors */}
                <line x1="110" y1="10" x2="106" y2="2" stroke="#1f2937" strokeWidth="2" />
                <circle cx="106" cy="2" r="4" fill="#e5e7eb" stroke="#1f2937" />
                <line x1="124" y1="10" x2="128" y2="2" stroke="#1f2937" strokeWidth="2" />
                <circle cx="128" cy="2" r="4" fill="#e5e7eb" stroke="#1f2937" />

                {/* Engine Cover */}
                <path d="M25 70 Q35 60 55 70" fill="none" stroke="#991b1b" strokeWidth="1" />
                
                {/* Suspension Fork */}
                <path d="M110 70 L115 90" stroke="#9ca3af" strokeWidth="4" />

                {/* Delivery Box */}
                <g transform="translate(10, 25)">
                  <rect x="0" y="0" width="38" height="32" rx="4" fill="#16a34a" stroke="#14532d" strokeWidth="1" />
                  <path d="M0 10 L38 10" stroke="#14532d" strokeWidth="1" />
                  <rect x="10" y="15" width="18" height="10" fill="white" rx="1" opacity="0.9"/>
                  <text x="19" y="22" fontSize="6" fontFamily="sans-serif" fontWeight="bold" fill="#15803d" textAnchor="middle">Veg</text>
                  <text x="19" y="28" fontSize="4" fontFamily="sans-serif" fill="#15803d" textAnchor="middle">Haat</text>
                </g>

                {/* Rider */}
                <g transform="translate(60, 15)">
                   <path d="M15 45 L30 65 L45 65" stroke="#1e40af" strokeWidth="7" strokeLinecap="round" fill="none" />
                   <path d="M20 45 L22 15" stroke="#ef4444" strokeWidth="14" strokeLinecap="round" />
                   <path d="M22 20 L45 20 L52 10" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" fill="none" />
                   <path d="M12 10 A 10 10 0 0 1 32 10 L 32 15 L 12 15 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                   <path d="M25 8 L32 8" stroke="#333" strokeWidth="3" opacity="0.6" /> 
                </g>
             </svg>
          </div>
       </div>
    </div>
  );
};

export default DeliveryAnimation;