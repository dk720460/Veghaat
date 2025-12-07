

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, ArrowUpDown, ChevronDown, Clock, Minus, Plus, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductListingPageProps {
  title: string;
  onBack: () => void;
  cartItems: Record<string, number>;
  onUpdateQuantity: (e: React.MouseEvent, product: Product, delta: number) => void;
  onProductClick: (product: Product) => void;
  products: Product[];
  onSearchClick: () => void;
}

type SortOption = 'relevance' | 'price_low' | 'price_high' | 'name_asc';

const ProductListingPage: React.FC<ProductListingPageProps> = ({ 
  title, 
  onBack, 
  cartItems, 
  onUpdateQuantity, 
  onProductClick,
  products,
  onSearchClick
}) => {
  // Sidebar State
  const [selectedSidebarId, setSelectedSidebarId] = useState<string>('all');
  
  // Sort & Filter State
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterDiscount, setFilterDiscount] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- DYNAMIC & CONTEXT-AWARE SIDEBAR GENERATION ---
  const sidebarData = useMemo(() => {
    const allCategories = (Array.from(new Set(products.map(p => p.category))).filter(Boolean) as string[]);
    
    let relevantCategories: string[] = [];

    if (title === 'Vegetables & Fruit' || title.includes('Vegetable') || title.includes('Fruit')) {
        relevantCategories = allCategories.filter(cat => 
            cat.includes('Vegetable') || 
            cat.includes('Fruit') || 
            cat.includes('Exotic') || 
            cat.includes('Flower') || 
            cat.includes('Cut') || 
            cat.includes('Sprout') || 
            cat.includes('Herb') || 
            cat.includes('Organic') ||
            cat.includes('Seasonal')
        );
        
        const priority = ['Fresh Vegetables', 'Fresh Fruits', 'Exotics', 'Leafy Vegetables', 'Flowers & Leaves'];
        relevantCategories.sort((a, b) => {
            const idxA = priority.indexOf(a);
            const idxB = priority.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });

    } else if (title.includes('Dairy') || title.includes('Bread') || title.includes('Breakfast')) {
        relevantCategories = allCategories.filter(cat => 
            cat.includes('Milk') || cat.includes('Bread') || cat.includes('Egg') || cat.includes('Butter') || cat.includes('Curd') || cat.includes('Cheese') || cat.includes('Yogurt') || cat.includes('Breakfast')
        );
    } else if (title.includes('Snack') || title.includes('Munchies')) {
        relevantCategories = allCategories.filter(cat => 
            cat.includes('Chip') || cat.includes('Snack') || cat.includes('Chocolate') || cat.includes('Biscuit') || cat.includes('Cookie') || cat.includes('Namkeen')
        );
    } else {
        relevantCategories = allCategories.sort();
    }

    if (relevantCategories.length === 0) {
        relevantCategories = allCategories.sort();
    }

    const dynamicItems = relevantCategories.map(cat => {
        const sampleProduct = products.find(p => p.category === cat);
        const fallbackImage = 'https://cdn-icons-png.flaticon.com/512/776/776645.png';
        return {
            id: cat,
            name: cat,
            image: sampleProduct?.image || fallbackImage
        };
    });

    return [
        { id: 'all', name: 'All', image: 'https://cdn-icons-png.flaticon.com/512/776/776645.png' },
        ...dynamicItems
    ];
  }, [title, products]);

  // Reset selection when title changes
  useEffect(() => {
    setSelectedSidebarId('all');
  }, [title]);


  // --- FILTERING & SORTING LOGIC ---
  const displayedItems = useMemo(() => {
    let items = [...(products || [])];

    if (selectedSidebarId !== 'all') {
        items = items.filter(item => item.category === selectedSidebarId);
    } else {
        const validCategories = sidebarData.map(s => s.name); 
        items = items.filter(item => validCategories.includes(item.category));
    }

    if (filterDiscount) {
        items = items.filter(item => item.discount && item.discount.includes('OFF'));
    }

    switch (sortOption) {
        case 'price_low':
            items.sort((a, b) => Number(a.price) - Number(b.price));
            break;
        case 'price_high':
            items.sort((a, b) => Number(b.price) - Number(a.price));
            break;
        case 'name_asc':
            items.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default:
            break;
    }

    return items;
  }, [products, selectedSidebarId, sidebarData, sortOption, filterDiscount]);

  // --- PROFESSIONAL STEP-BY-STEP BACK NAVIGATION ---
  const handleInternalBack = () => {
    // 1. If a filter/sort menu is open, close it first
    if (showSortMenu || showFilterMenu) {
        setShowSortMenu(false);
        setShowFilterMenu(false);
        return;
    }

    // 2. If a specific sidebar category is selected, go back to 'All' view first
    if (selectedSidebarId !== 'all') {
      setSelectedSidebarId('all');
    } else {
      // 3. Otherwise, navigate back to the previous screen (Home/Category List)
      onBack();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FD] flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleInternalBack} 
            className="p-3 -ml-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">
                {title}
            </h1>
            <p className="text-xs text-gray-500 flex items-center mt-0.5">
              Select Location <ChevronDown size={12} className="ml-1"/>
            </p>
          </div>
        </div>
        <button onClick={onSearchClick} className="p-2 rounded-full hover:bg-gray-100 ml-2">
           <Search size={22} className="text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR (Left) */}
        <div className="w-[88px] bg-white h-full overflow-y-auto border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] pb-24 no-scrollbar flex-shrink-0">
          {sidebarData.map((cat) => {
            const isSelected = selectedSidebarId === cat.id;
            return (
              <div 
                key={cat.id}
                onClick={() => setSelectedSidebarId(cat.id)}
                className={`flex flex-col items-center py-4 px-1 cursor-pointer transition-all border-l-4 relative group ${
                  isSelected ? 'border-green-600 bg-green-50/60' : 'border-transparent hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full overflow-hidden mb-2 flex items-center justify-center transition-all ${
                    isSelected 
                    ? 'border-2 border-green-500 bg-white shadow-sm scale-105' 
                    : 'bg-gray-50 border border-gray-100 group-hover:border-green-200'
                }`}>
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <span className={`text-[10px] text-center font-medium leading-tight line-clamp-2 px-1 w-full ${
                    isSelected ? 'text-green-800 font-bold' : 'text-gray-500 group-hover:text-green-700'
                }`}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* GRID (Right) */}
        <div className="flex-1 overflow-y-auto bg-[#F5F7FD] pb-32 relative">
          
          {/* Filters & Sort Bar */}
          <div className="sticky top-0 z-10 bg-[#F5F7FD] px-3 py-3 flex space-x-2 overflow-visible" ref={sortRef}>
            <div className="relative">
                <button 
                    onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
                    className={`flex items-center space-x-1 border rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm whitespace-nowrap transition-colors ${
                        filterDiscount ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                >
                    <SlidersHorizontal size={14} /> <span>Filter</span> <ChevronDown size={12} />
                </button>
                
                {showFilterMenu && (
                    <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-scale-up origin-top-left">
                        <button 
                            onClick={() => { setFilterDiscount(!filterDiscount); setShowFilterMenu(false); }}
                            className="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <span>Discounts Only</span>
                            {filterDiscount && <Check size={14} className="text-green-600" />}
                        </button>
                    </div>
                )}
            </div>

            <div className="relative">
                <button 
                    onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
                    className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm whitespace-nowrap active:bg-gray-50"
                >
                    <ArrowUpDown size={14} /> <span>Sort</span> <ChevronDown size={12} />
                </button>

                {showSortMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 animate-scale-up origin-top-left">
                        {[
                            { id: 'relevance', label: 'Relevance (Default)' },
                            { id: 'price_low', label: 'Price (Low to High)' },
                            { id: 'price_high', label: 'Price (High to Low)' },
                            { id: 'name_asc', label: 'Name (A to Z)' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => { setSortOption(opt.id as SortOption); setShowSortMenu(false); }}
                                className={`w-full text-left px-4 py-3 text-xs font-medium hover:bg-gray-50 flex justify-between items-center transition-colors ${
                                    sortOption === opt.id ? 'text-green-700 bg-green-50' : 'text-gray-700'
                                }`}
                            >
                                <span>{opt.label}</span>
                                {sortOption === opt.id && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>

          <div className="px-3 pb-2 flex items-baseline justify-between">
               <div>
                   <h2 className="text-sm font-bold text-gray-800">
                       {selectedSidebarId === 'all' ? `All ${title}` : selectedSidebarId}
                   </h2>
                   <p className="text-[10px] text-gray-500">{displayedItems.length} items</p>
               </div>
          </div>

          <div className="grid grid-cols-2 gap-3 px-3">
            {displayedItems.length === 0 ? (
                <div className="col-span-2 flex flex-col items-center justify-center py-20 text-gray-400">
                    <img src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" alt="No items" className="w-16 h-16 mb-4 opacity-50 grayscale" />
                    <p className="text-sm font-medium">No products found</p>
                    <p className="text-xs">Try different filters or category</p>
                </div>
            ) : (
                displayedItems.map((item) => {
                const qty = cartItems[item.id] || 0;
                
                return (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm flex flex-col justify-between relative group hover:shadow-md transition-shadow h-64">
                    
                    <div onClick={() => onProductClick(item)} className="cursor-pointer relative h-32 mb-2 w-full flex items-center justify-center bg-white rounded-lg overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300" />
                        
                        {/* ETA Badge on Image */}
                         <div className="absolute bottom-1 left-1 bg-gray-100/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-600 flex items-center space-x-1 shadow-sm">
                            <Clock size={9} />
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
                                    className="w-16 h-8 bg-white border border-green-600 text-green-700 text-xs font-black rounded-lg shadow-sm hover:bg-green-50 uppercase tracking-wide active:scale-95 transition-transform"
                                >
                                    ADD
                                </button>
                            ) : (
                                <div className="flex items-center bg-green-600 text-white rounded-lg shadow-sm h-8 w-16 px-1 justify-between">
                                    <button 
                                        onClick={(e) => onUpdateQuantity(e, item, -1)}
                                        className="w-5 h-full flex items-center justify-center active:bg-green-700"
                                    >
                                        <Minus size={12} strokeWidth={3} />
                                    </button>
                                    <span className="text-xs font-bold">{qty}</span>
                                    <button 
                                        onClick={(e) => onUpdateQuantity(e, item, 1)}
                                        className="w-5 h-full flex items-center justify-center active:bg-green-700"
                                    >
                                        <Plus size={12} strokeWidth={3} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BLINKIT STYLE DISCOUNT BADGE - ROYAL BLUE */}
                    {item.discount && (
                    <div className="absolute top-0 left-0 bg-[#2563eb] text-white text-[9px] font-black px-2 py-0.5 rounded-br-lg rounded-tl-lg shadow-sm z-10 tracking-wide uppercase">
                        {item.discount}
                    </div>
                    )}
                </div>
                );})
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListingPage;
