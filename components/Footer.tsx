import React from 'react';
import { Home, LayoutGrid, ShoppingBag, ShoppingCart, Search } from 'lucide-react';

interface FooterProps {
  cartCount: number;
  activeTab: string;
  onTabSelect: (tab: string) => void;
}

const Footer: React.FC<FooterProps> = ({ cartCount, activeTab, onTabSelect }) => {
  
  const getButtonClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-95 ${
      isActive ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
    }`;
  };

  const getLabelClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `text-[10px] font-medium mt-1 ${isActive ? 'text-green-600 font-bold' : 'text-gray-500'}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-between px-2 z-[100] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      <button onClick={() => onTabSelect('home')} className={getButtonClass('home')}>
        <Home size={22} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        <span className={getLabelClass('home')}>Home</span>
      </button>
      
      <button onClick={() => onTabSelect('categories')} className={getButtonClass('categories')}>
        <LayoutGrid size={22} strokeWidth={activeTab === 'categories' ? 2.5 : 2} />
        <span className={getLabelClass('categories')}>Categories</span>
      </button>

      <button onClick={() => onTabSelect('cart')} className={`${getButtonClass('cart')} relative`}>
        <div className="relative">
          <ShoppingCart size={22} strokeWidth={activeTab === 'cart' ? 2.5 : 2} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              {cartCount}
            </span>
          )}
        </div>
        <span className={getLabelClass('cart')}>Cart</span>
      </button>

      <button onClick={() => onTabSelect('orders')} className={getButtonClass('orders')}>
        <ShoppingBag size={22} strokeWidth={activeTab === 'orders' ? 2.5 : 2} />
        <span className={getLabelClass('orders')}>Orders</span>
      </button>
    </div>
  );
};

export default Footer;