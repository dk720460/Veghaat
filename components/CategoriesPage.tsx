

import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { MAIN_SECTIONS } from '../constants';

interface CategoriesPageProps {
  onBack: () => void;
  onCategoryClick: (category: string) => void;
  onSearchClick: () => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ onBack, onCategoryClick, onSearchClick }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FD] flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-3 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">All Categories</h1>
        </div>
        <button onClick={onSearchClick} className="p-2 rounded-full hover:bg-gray-100">
           <Search size={22} className="text-gray-700" />
        </button>
      </div>

      {/* Categories Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
        {(MAIN_SECTIONS || []).map((section, idx) => (
          <div key={idx} className="mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-3 px-1">{section.title}</h2>
            <div className="grid grid-cols-4 gap-3">
              {(section.subCategories || []).map((sub, sIdx) => (
                <div 
                  key={sIdx} 
                  onClick={() => onCategoryClick(sub.name)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden mb-2 group-hover:border-green-500 transition-colors">
                    <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[10px] font-medium text-center text-gray-600 leading-tight group-hover:text-green-700">
                    {sub.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;