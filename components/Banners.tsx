
import React, { useRef, useEffect } from 'react';
import { Banner } from '../types';

interface BannersProps {
  banners: Banner[];
  onBannerClick: () => void;
}

const Banners: React.FC<BannersProps> = ({ banners, onBannerClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const autoScroll = setInterval(() => {
      // Calculate next scroll position
      const isEnd = container.scrollLeft + container.offsetWidth >= container.scrollWidth - 10; // -10 tolerance
      
      if (isEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollTo({ 
          left: container.scrollLeft + container.offsetWidth * 0.8, // Scroll 80% of width
          behavior: 'smooth' 
        });
      }
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(autoScroll);
  }, []);

  if (!banners || banners.length === 0) return null;

  return (
    <div className="w-full px-4 py-4">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory space-x-4 no-scrollbar rounded-2xl"
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            onClick={onBannerClick}
            className="snap-center flex-shrink-0 w-full md:w-[85%] lg:w-[45%] h-48 md:h-64 relative rounded-2xl overflow-hidden shadow-md cursor-pointer group active:scale-95 transition-transform duration-200"
          >
            <img 
              src={banner.image} 
              alt="Promo Banner" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent flex flex-col justify-end p-6">
                 <span className="bg-white text-black text-xs font-bold px-2 py-1 rounded w-max mb-2">Promoted</span>
                 <h3 className="text-white text-2xl font-bold drop-shadow-md">Super Saver Deal</h3>
                 <p className="text-gray-100 text-sm drop-shadow">Up to 50% OFF</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banners;