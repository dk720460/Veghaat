import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Share2, Heart, Clock, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsPageProps {
  product: Product;
  onBack: () => void;
  cartItems: Record<string, number>;
  onUpdateQuantity: (e: React.MouseEvent, product: Product, delta: number) => void;
  onProductClick: (product: Product) => void;
  products: Product[];
  onSearchClick: () => void;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({ 
  product, 
  onBack, 
  cartItems,
  onUpdateQuantity, 
  onProductClick,
  products,
  onSearchClick
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(0); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const quantity = cartItems[product.id] || 0;
  
  // Similar products from live data
  const similarProducts = (products || []).filter(item => item.id !== product.id).slice(0, 4);
  
  // Ensure numeric price
  const price = Number(product.price);
  
  // Images for Carousel
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  // Carousel Logic
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Auto Slide
  useEffect(() => {
     if (images.length <= 1) return;
     const interval = setInterval(() => {
         setCurrentImageIndex(prev => (prev + 1) % images.length);
     }, 3000);
     return () => clearInterval(interval);
  }, [images.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
      touchStartX.current = e.targetTouches[0].clientX;
      touchEndX.current = e.targetTouches[0].clientX; // Initialize end with start
  };

  const handleTouchMove = (e: React.TouchEvent) => {
      touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50; // Minimum swipe distance

      if (diff > threshold) {
          // Swipe Left (Next)
          setCurrentImageIndex(prev => (prev + 1) % images.length);
      } else if (diff < -threshold) {
          // Swipe Right (Prev)
          setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
      }
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 mx-auto max-w-[480px] z-[60] bg-white flex flex-col overflow-y-auto pb-40 animate-scale-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <button onClick={onBack} className="p-3 -ml-2 rounded-full bg-gray-100/80 hover:bg-gray-200">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div className="flex items-center space-x-3">
          <button onClick={onSearchClick} className="p-2 rounded-full bg-gray-100/80 hover:bg-gray-200">
             <Search size={22} className="text-gray-700" />
          </button>
          <button className="p-2 rounded-full bg-gray-100/80 hover:bg-gray-200">
             <Share2 size={22} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Hero Image Carousel */}
      <div 
        className="relative w-full h-80 bg-[#F5F7FD] overflow-hidden"
        style={{ touchAction: 'pan-y' }} 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
         {/* Carousel Strip */}
         <div 
            className="flex w-full h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
         >
            {images.map((img, idx) => (
                <div key={idx} className="w-full h-full flex-shrink-0 flex items-center justify-center p-6">
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
            ))}
         </div>

         {/* Navigation Dots */}
         {images.length > 1 && (
             <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                 {images.map((_, idx) => (
                     <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-green-600' : 'bg-gray-300'}`}
                     ></div>
                 ))}
             </div>
         )}
         
         {/* REMOVED ABSOLUTE DISCOUNT BADGE FROM HERE */}

         <button className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 z-10">
            <Heart size={24} />
         </button>
         <div className="absolute bottom-4 left-4 bg-gray-100 px-2 py-1 rounded flex items-center space-x-1 z-10">
             <Clock size={12} className="text-green-700" />
             <span className="text-[10px] font-bold text-gray-700">{product.eta || '20 MINS'}</span>
         </div>
      </div>

      {/* Info Section */}
      <div className="px-4 py-4">
         <h1 className="text-xl font-bold text-gray-900 leading-snug mb-4">{product.name}</h1>
         
         {/* Unit Selection */}
         <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 mb-2">Select Unit</p>
            <div className="flex space-x-3">
               <div 
                 onClick={() => setSelectedUnit(0)}
                 className={`border rounded-xl p-3 flex-1 cursor-pointer relative overflow-hidden transition-all ${
                   selectedUnit === 0 ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 bg-white'
                 }`}
               >
                  {selectedUnit === 0 && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-gray-800">{product.weight || '1 kg'}</p>
                    <div className="flex items-center space-x-2 mt-1">
                       <span className="text-sm font-bold text-gray-900">₹{price}</span>
                       {product.originalPrice && <span className="text-xs text-gray-400 line-through">MRP ₹{product.originalPrice}</span>}
                    </div>
                  </div>
               </div>

               <div 
                 onClick={() => setSelectedUnit(1)}
                 className={`border rounded-xl p-3 flex-1 cursor-pointer relative overflow-hidden transition-all ${
                   selectedUnit === 1 ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 bg-white'
                 }`}
               >
                  {selectedUnit === 1 && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-gray-800">2 x ({product.weight || '1 kg'})</p>
                    <div className="flex items-center space-x-2 mt-1">
                       <span className="text-sm font-bold text-gray-900">₹{price * 2}</span>
                   </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Price & Add To Cart Action */}
         <div className="flex items-center justify-between mb-6">
             <div className="flex flex-col">
                <div className="flex items-center space-x-2 mb-0.5">
                    {product.originalPrice && (
                        <span className="text-xs font-bold text-gray-400 line-through">MRP ₹{product.originalPrice}</span>
                    )}
                    {/* NEW POSITION FOR DISCOUNT BADGE */}
                    {product.discount && (
                        <span className="bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                            {product.discount}
                        </span>
                    )}
                </div>
                <span className="text-2xl font-black text-gray-900">
                    {/* Display Dynamic Price based on selection */}
                    ₹{selectedUnit === 1 ? price * 2 : price}
                </span>
                <span className="text-[10px] text-gray-500">(Incl. of all taxes)</span>
             </div>

             {/* Quantity Counter */}
             {quantity === 0 ? (
                 <button 
                   onClick={(e) => {
                       // If 2x is selected, add 2 items
                       const qtyToAdd = selectedUnit === 1 ? 2 : 1;
                       onUpdateQuantity(e, product, qtyToAdd);
                   }}
                   className="bg-green-600 text-white text-sm font-bold w-32 py-3 rounded-lg shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center uppercase tracking-wide"
                 >
                    ADD
                 </button>
             ) : (
                 <div className="flex items-center justify-between bg-green-600 text-white w-32 py-2 rounded-lg shadow-lg shadow-green-200">
                    <button onClick={(e) => onUpdateQuantity(e, product, -1)} className="px-3 py-1 hover:bg-green-700 rounded-l-lg active:scale-90 transition-transform">
                        <Minus size={18} strokeWidth={3} />
                    </button>
                    <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                    <button onClick={(e) => onUpdateQuantity(e, product, 1)} className="px-3 py-1 hover:bg-green-700 rounded-r-lg active:scale-90 transition-transform">
                        <Plus size={18} strokeWidth={3} />
                    </button>
                 </div>
             )}
         </div>

         {/* Accordion */}
         <div className="border-t border-b border-gray-100 py-4">
            <button 
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="flex items-center justify-between w-full"
            >
              <span className="text-sm font-bold text-gray-800">View product details</span>
              {isDetailsOpen ? <ChevronUp size={18} className="text-gray-500"/> : <ChevronDown size={18} className="text-gray-500"/>}
            </button>
            {isDetailsOpen && (
               <div className="mt-3 text-sm text-gray-500 leading-relaxed animate-fade-in">
                  {product.details || "Fresh and high quality product."}
               </div>
            )}
         </div>
      </div>

      {/* Similar Products */}
      <div className="px-4 py-4 bg-gray-50/50">
         <h2 className="text-lg font-bold text-gray-900 mb-4">Similar products</h2>
         <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
            {similarProducts.map((item) => {
               const itemQty = cartItems[item.id] || 0;
               // Ensure numeric price for similar items too
               const itemPrice = Number(item.price);
               return (
               <div key={item.id} className="min-w-[140px] w-[140px] bg-white rounded-xl border border-gray-100 p-2 shadow-sm flex flex-col justify-between relative group hover:shadow-md transition-shadow">
                  <div onClick={() => onProductClick(item)} className="relative h-24 mb-2 cursor-pointer">
                     <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                     <p className="text-[10px] text-gray-500 mb-0.5">{item.eta || '20 MINS'}</p>
                     <h3 onClick={() => onProductClick(item)} className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-2 h-8 cursor-pointer">{item.name}</h3>
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-[10px] text-gray-400">{item.weight}</p>
                           <p className="text-xs font-bold text-gray-900">₹{itemPrice}</p>
                        </div>
                        
                        {itemQty === 0 ? (
                            <button 
                              onClick={(e) => onUpdateQuantity(e, item, 1)}
                              className="px-3 py-1 bg-white border border-green-600 text-green-700 text-[10px] font-bold rounded shadow-sm hover:bg-green-50 uppercase"
                            >
                              ADD
                            </button>
                        ) : (
                           <div className="flex items-center bg-green-600 text-white rounded shadow-sm h-6 px-1">
                                <button onClick={(e) => onUpdateQuantity(e, item, -1)} className="px-1"><Minus size={10} strokeWidth={3}/></button>
                                <span className="text-[10px] font-bold px-1">{itemQty}</span>
                                <button onClick={(e) => onUpdateQuantity(e, item, 1)} className="px-1"><Plus size={10} strokeWidth={3}/></button>
                           </div>
                        )}
                     </div>
                  </div>
                   {item.discount && (
                    <div className="absolute top-0 left-0 bg-[#2563eb] text-white text-[9px] font-black px-2 py-0.5 rounded-br-lg rounded-tl-xl shadow-sm z-10 uppercase tracking-wide">
                        {item.discount}
                    </div>
                  )}
               </div>
            );})}
         </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;