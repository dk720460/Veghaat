
import React from 'react';

interface CategoryBarProps {
  activeCategory: string;
  onSelectCategory: (id: string, targetId: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ activeCategory, onSelectCategory }) => {
  
  // Professional Image-based Categories
  const quickCategories = [
    { 
      id: 'all', 
      label: 'All', 
      // 4-box grid icon
      image: 'https://cdn-icons-png.flaticon.com/512/3523/3523887.png', 
      target: 'top',
      bgColor: 'bg-green-50'
    },
    { 
      id: 'veg', 
      label: 'Vegetables', 
      image: 'https://cdn-icons-png.flaticon.com/512/2329/2329903.png', 
      target: 'Vegetables & Fruit',
      bgColor: 'bg-orange-50'
    },
    { 
      id: 'fruit', 
      label: 'Fruits', 
      image: 'https://cdn-icons-png.flaticon.com/512/3194/3194766.png', 
      target: 'Vegetables & Fruit',
      bgColor: 'bg-red-50'
    }, 
    { 
      id: 'dairy', 
      label: 'Dairy', 
      image: 'https://cdn-icons-png.flaticon.com/512/2674/2674486.png', 
      target: 'Dairy Bread & Egg',
      bgColor: 'bg-blue-50'
    },
    { 
      id: 'chips', 
      label: 'Munchies', 
      image: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', 
      target: 'Chips & Namkeen',
      bgColor: 'bg-yellow-50'
    },
    { 
      id: 'drinks', 
      label: 'Cold Drinks', 
      image: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png', 
      target: 'Drinks & Juices',
      bgColor: 'bg-purple-50'
    },
    { 
        id: 'bakery', 
        label: 'Bakery', 
        image: 'https://cdn-icons-png.flaticon.com/512/992/992747.png', 
        target: 'Dairy Bread & Egg',
        bgColor: 'bg-amber-50'
    },
  ];

  return (
    <div className="bg-white pb-2 pt-2 border-t border-gray-100">
      <div className="flex overflow-x-auto no-scrollbar px-4 space-x-5 py-1 items-start">
        {quickCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          
          return (
            <button 
              key={cat.id} 
              className="flex-shrink-0 flex flex-col items-center space-y-2 group min-w-[64px]"
              onClick={() => onSelectCategory(cat.id, cat.target)}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm relative overflow-hidden ${cat.bgColor} ${
                  isActive 
                  ? 'ring-2 ring-green-500 scale-105' 
                  : 'hover:shadow-md'
              }`}>
                 <img src={cat.image} alt={cat.label} className="w-10 h-10 object-contain drop-shadow-sm transition-transform group-hover:scale-110" />
              </div>
              <span className={`text-[11px] font-bold text-center leading-tight w-full truncate ${
                  isActive ? 'text-green-700' : 'text-gray-700'
              }`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;