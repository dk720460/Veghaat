
import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface ViewCartStickyBarProps {
  itemCount: number;
  totalPrice: number;
  onViewCart: () => void;
}

const ViewCartStickyBar: React.FC<ViewCartStickyBarProps> = ({ itemCount, totalPrice, onViewCart }) => {
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 z-[110] flex justify-center pointer-events-none">
      <div className="animate-scale-up pointer-events-auto">
        <button 
          onClick={onViewCart}
          className="w-16 h-16 bg-[#0C831F] rounded-full shadow-[0_10px_40px_-10px_rgba(12,131,31,0.6)] flex flex-col items-center justify-center relative border-4 border-white active:scale-90 transition-transform duration-200 group"
        >
          {/* Badge for Count - Floating outside like a notification bubble */}
          <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20">
             {itemCount}
          </div>

          {/* Icon */}
          <ShoppingBag size={22} className="text-white mb-0.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />

          {/* Price */}
          <span className="text-[10px] font-black text-white leading-none bg-green-800/30 px-1.5 py-0.5 rounded-full mt-0.5">
             ₹{totalPrice}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ViewCartStickyBar;
