
import React from 'react';
import { MainSection } from '../types';

interface SectionListProps {
  sections: MainSection[];
  onCategoryClick: (categoryName: string) => void;
}

const SectionList: React.FC<SectionListProps> = ({ sections, onCategoryClick }) => {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="pb-4">
      {sections.map((section, index) => (
        <div key={index} className="mb-4 bg-white border-t border-b border-gray-100 py-6">
          <div className="px-4 mb-4 flex justify-between items-end">
            <div>
                 <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
            </div>
            <button 
              onClick={() => onCategoryClick(section.title)}
              className="text-xs text-green-600 font-bold uppercase tracking-wide hover:underline"
            >
              See all
            </button>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-y-6 gap-x-3 px-3">
            {(section.subCategories || []).map((sub, subIdx) => {
              // Create a safe ID for scrolling (replace spaces with hyphens)
              const safeId = sub.name.replace(/\s+/g, '-');
              
              return (
                <div 
                  key={subIdx} 
                  id={safeId} 
                  className="flex flex-col items-center group relative cursor-pointer"
                  onClick={() => onCategoryClick(sub.name)} 
                >
                  {/* Product Image Container */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-2xl mb-2 overflow-visible shadow-sm border border-transparent group-hover:border-green-500 transition-all active:scale-95 duration-200">
                    <img src={sub.image} alt={sub.name} className="w-full h-full object-cover rounded-2xl" />
                  </div>
                  
                  <span className="text-xs font-medium text-center text-gray-700 w-24 leading-tight group-hover:text-green-700">
                      {sub.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SectionList;