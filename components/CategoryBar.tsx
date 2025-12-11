
import React from 'react';
import ImageWithLoader from './ImageWithLoader';

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
      image: 'https://i.ibb.co/tMXjVbZC/blob.png', 
      target: 'Vegetables & Fruit',
      bgColor: 'bg-green-50'
    },
    { 
      id: 'fruit', 
      label: 'Fruits', 
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=100&q=60', 
      target: 'Vegetables & Fruit',
      bgColor: 'bg-orange-50'
    }, 
    { 
      id: 'dairy', 
      label: 'Dairy', 
      image: 'https://i.ibb.co/JjKGtjcf/blob.jpg', 
      target: 'Dairy Bread & Egg',
      bgColor: 'bg-blue-50'
    },
    { 
      id: 'drinks', 
      label: 'Cold Drinks', 
      image: 'https://i.ibb.co/C5PX8MkN/blob.jpg', 
      target: 'Drinks & Juices',
      bgColor: 'bg-purple-50'
    },
    { 
        id: 'bakery', 
        label: 'Bakery', 
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=100&q=60', 
        target: 'Dairy Bread & Egg',
        bgColor: 'bg-amber-50'
    },
  ];

  return (
    <div className="bg-white pb-2 pt-2 border-t border-gray-100">
      <div className="flex overflow-x-auto no-scrollbar px-4 space-x-4 py-1 items-start">
        {quickCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          
          return (
            <button 
              key={cat.id} 
              className="flex-shrink-0 flex flex-col items-center space-y-1.5 group min-w-[50px]"
              onClick={() => onSelectCategory(cat.id, cat.target)}
            >
              {/* Reduced size: w-16 -> w-11 (approx 30% less) */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm relative overflow-hidden ${cat.bgColor} ${
                  isActive 
                  ? 'ring-2 ring-green-500 scale-105' 
                  : 'hover:shadow-md'
              }`}>
                 <ImageWithLoader 
                    src={cat.image} 
                    alt={cat.label} 
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover mix-blend-multiply" 
                    useSkeleton={false}
                 />
              </div>
              <span className={`text-[9px] font-bold text-center leading-tight w-full truncate ${
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
