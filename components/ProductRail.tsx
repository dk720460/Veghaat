
import React from 'react';
import { Clock, Minus, Plus, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import ImageWithLoader from './ImageWithLoader';

interface ProductRailProps {
  title: string;
  products: Product[];
  cartItems: Record<string, number>;
  onUpdateQuantity: (e: React.MouseEvent, product: Product, delta: number) => void;
  onProductClick: (product: Product) => void;
  onCategoryClick: (category: string) => void;
  bgColor?: string;
}

const ProductRail: React.FC<ProductRailProps> = ({ 
  title, 
  products, 
  cartItems, 
  onUpdateQuantity, 
  onProductClick,
  onCategoryClick,
  bgColor = 'bg-white'
}) => {
  if (!products || products.length === 0) return null;

  return (
    <div className={`py-6 border-b border-gray-100 ${bgColor}`}>
      <div className="px-4 mb-4 flex justify-between items-end">
        <div>
           <h2 className="text-xl font-bold text-gray-900">{title}</h2>
           <p className="text-xs text-gray-500">{products.length} items</p>
        </div>
        <button 
          onClick={() => onCategoryClick(title)}
          className="text-xs text-green-600 font-bold uppercase tracking-wide flex items-center"
        >
          See all <ChevronRight size={14} />
        </button>
      </div>

      <div className="flex overflow-x-auto no-scrollbar px-4 space-x-3 pb-2" style={{ willChange: 'transform' }}>
        {products.map((item) => {
          const qty = cartItems[item.id] || 0;
          return (
            <div key={item.id} className="min-w-[140px] w-[140px] bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col justify-between relative group hover:shadow-md transition-shadow h-64">
                
                <div onClick={() => onProductClick(item)} className="cursor-pointer relative h-28 mb-2 w-full flex items-center justify-center bg-white rounded-lg overflow-hidden">
                    <ImageWithLoader 
                        src={item.image} 
                        alt={item.name} 
                        containerClassName="w-full h-full"
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300" 
                    />
                    
                    {/* ETA Badge */}
                    <div className="absolute bottom-1 left-1 bg-gray-100/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-gray-600 flex items-center space-x-1 shadow-sm z-20">
                        <Clock size={8} />
                        <span>{item.eta || '20m'}</span>
                    </div>
                </div>

                <div className="flex flex-col flex-1 justify-between">
                     <div onClick={() => onProductClick(item)} className="cursor-pointer">
                        <h3 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{item.name}</h3>
                        <p className="text-[10px] text-gray-500">{item.weight || '1 kg'}</p>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                        <div className="flex flex-col leading-none">
                            {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-[10px] text-gray-400 line-through font-medium mb-0.5">₹{item.originalPrice}</span>
                            )}
                            <span className="text-sm font-black text-gray-900">₹{item.price}</span>
                        </div>
                        
                        {qty === 0 ? (
                            <button 
                                onClick={(e) => onUpdateQuantity(e, item, 1)}
                                className="w-16 h-7 bg-white border border-green-600 text-green-700 text-[10px] font-black rounded-lg shadow-sm hover:bg-green-50 uppercase tracking-wide active:scale-95 transition-transform"
                            >
                                ADD
                            </button>
                        ) : (
                            <div className="flex items-center bg-green-600 text-white rounded-lg shadow-sm h-7 w-16 px-1 justify-between">
                                <button 
                                    onClick={(e) => onUpdateQuantity(e, item, -1)}
                                    className="w-5 h-full flex items-center justify-center active:bg-green-700"
                                >
                                    <Minus size={10} strokeWidth={3} />
                                </button>
                                <span className="text-[10px] font-bold">{qty}</span>
                                <button 
                                    onClick={(e) => onUpdateQuantity(e, item, 1)}
                                    className="w-5 h-full flex items-center justify-center active:bg-green-700"
                                >
                                    <Plus size={10} strokeWidth={3} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* BLINKIT STYLE DISCOUNT BADGE - ROYAL BLUE */}
                {item.discount && (
                  <div className="absolute top-0 left-0 bg-[#2563eb] text-white text-[8px] font-black px-2 py-0.5 rounded-br-lg rounded-tl-lg shadow-sm z-10 tracking-wide uppercase">
                      {item.discount}
                  </div>
                )}
            </div>
          );
        })}
        
        {/* View All Card */}
        <div className="min-w-[100px] flex items-center justify-center">
            <div 
              onClick={() => onCategoryClick(title)}
              className="flex flex-col items-center justify-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">
                  <ChevronRight size={24} />
              </div>
              <span className="text-xs font-bold text-gray-500 mt-2 ml-1 group-hover:text-green-700">View All</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRail;
