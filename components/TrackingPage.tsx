
import React, { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Phone, MapPin, Clock, ChevronDown, ChevronUp, XCircle, RefreshCcw, ShieldCheck } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Order, Product } from '../types';

interface TrackingPageProps {
  order: Order;
  onBack: () => void;
  products?: Product[];
  onProductClick?: (product: Product) => void;
}

const TrackingPage: React.FC<TrackingPageProps> = ({ order, onBack, products, onProductClick }) => {
  // Use local state to store the LIVE updated order object
  const [liveOrder, setLiveOrder] = useState<Order>(order);
  const [isItemsOpen, setIsItemsOpen] = useState(false);

  // Listen for Realtime Updates from Firebase
  useEffect(() => {
    const orderRef = ref(db, `orders/${order.id}`);
    const unsubscribe = onValue(orderRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setLiveOrder(data);
        }
    });

    return () => unsubscribe();
  }, [order.id]);

  // --- STATUS NORMALIZATION LOGIC ---
  const normalizeStatus = (status: string) => {
      if (!status) return 'Processing';
      const s = status.toLowerCase().trim();
      
      if (s.includes('place')) return 'Placed';
      if (s.includes('process')) return 'Processing';
      if (s.includes('confirm')) return 'Confirmed';
      if (s.includes('pack')) return 'Packing';
      if (s.includes('out')) return 'Out for Delivery';
      if (s.includes('deliver')) return 'Delivered';
      if (s.includes('cancel')) return 'Cancelled';
      if (s.includes('return')) return 'Returned';
      
      return 'Processing';
  };

  const currentStatusRaw = liveOrder.status;
  const currentStatusNormalized = normalizeStatus(currentStatusRaw);

  const isCancelled = currentStatusNormalized === 'Cancelled';
  const isReturned = currentStatusNormalized === 'Returned';
  const showDeliveryPartner = !isCancelled && !isReturned && (currentStatusNormalized === 'Out for Delivery' || currentStatusNormalized === 'Delivered');

  // UI Timeline Steps
  const STATUS_STEPS = ['Placed', 'Processing', 'Confirmed', 'Packing', 'Out for Delivery', 'Delivered'];

  // Helper to determine Progress Percentage and ETA based on Normalized Status
  const getStatusDetails = (status: string) => {
      switch (status) {
          case 'Placed': return { percent: 0, eta: '25 mins' };
          case 'Processing': return { percent: 10, eta: '25 mins' };
          case 'Confirmed': return { percent: 35, eta: '20 mins' }; 
          case 'Packing': return { percent: 60, eta: '18 mins' }; 
          case 'Out for Delivery': return { percent: 85, eta: '15 mins' }; 
          case 'Delivered': return { percent: 100, eta: 'Arrived' }; 
          default: return { percent: 10, eta: '20 mins' };
      }
  };

  const { percent: progressPercent, eta } = getStatusDetails(currentStatusNormalized);
  
  // Find current step index based on normalized status
  const currentStepIndex = STATUS_STEPS.indexOf(currentStatusNormalized);
  
  // --- BEZIER CURVE MATH FOR BIKE POSITION ---
  const bikePosition = useMemo(() => {
    const t = progressPercent / 100;
    
    const p0 = { x: 50, y: 80 };
    const p1 = { x: 120, y: 80 };
    const p2 = { x: 150, y: 150 };
    const p3 = { x: 300, y: 180 };

    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const x = (ax * Math.pow(t, 3)) + (bx * Math.pow(t, 2)) + (cx * t) + p0.x;
    const y = (ay * Math.pow(t, 3)) + (by * Math.pow(t, 2)) + (cy * t) + p0.y;

    return { x, y };
  }, [progressPercent]);

  const handleItemClick = (productId: string) => {
      if (products && onProductClick) {
          const product = products.find(p => p.id === productId);
          if (product) {
              onProductClick(product);
          }
      }
  };

  // Safe phone link generator
  const getPhoneLink = (phone?: string) => {
      if (!phone) return '#';
      // Remove spaces, dashes, brackets to make it a valid tel link
      return `tel:${phone.replace(/[^\d+]/g, '')}`;
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 mx-auto max-w-[480px] z-[70] bg-[#F5F7FD] flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center space-x-3 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <button onClick={onBack} className="p-3 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div>
           <h1 className="text-lg font-bold text-gray-900">Track Order</h1>
           <p className="text-xs text-gray-500">Order #{liveOrder.id}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        
        {/* --- CANCELLED / RETURNED VIEW --- */}
        {(isCancelled || isReturned) ? (
            <div className={`p-8 flex flex-col items-center justify-center text-center mt-10 mb-6 rounded-xl mx-4 ${isCancelled ? 'bg-red-50' : 'bg-orange-50'}`}>
                <div className={`p-4 rounded-full mb-4 ${isCancelled ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {isCancelled ? <XCircle size={48} /> : <RefreshCcw size={48} />}
                </div>
                <h2 className={`text-xl font-bold mb-2 ${isCancelled ? 'text-red-700' : 'text-orange-700'}`}>
                    {isCancelled ? 'Order Cancelled' : 'Order Returned'}
                </h2>
                <p className="text-sm text-gray-600">
                    {isCancelled 
                        ? 'This order has been cancelled. If you have paid online, the refund will be initiated shortly.' 
                        : 'Return request for this order has been processed.'}
                </p>
            </div>
        ) : (
        /* --- NORMAL TRACKING MAP --- */
        <div className="w-full h-72 bg-gray-200 relative overflow-hidden border-b border-gray-200">
           <div className="absolute inset-0 opacity-40" style={{
               backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)',
               backgroundSize: '20px 20px',
               backgroundColor: '#e2e8f0'
           }}></div>
           
           <svg className="absolute top-0 left-0 w-full h-full" style={{zIndex: 1}}>
              {/* Gray Base Path */}
              <path 
                d="M 50 80 C 120 80, 150 150, 300 180" 
                fill="none" 
                stroke="#d1d5db" 
                strokeWidth="6" 
                strokeLinecap="round"
                pathLength="100" 
              />
              {/* Green Progress Path */}
              <path 
                d="M 50 80 C 120 80, 150 150, 300 180" 
                fill="none" 
                stroke="#16a34a" 
                strokeWidth="6" 
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - progressPercent}
                className="transition-all duration-[2000ms] ease-in-out"
              />
           </svg>

           {/* Start Point (Store) */}
           <div className="absolute top-[60px] left-[30px] bg-white p-2 rounded-full shadow-lg border-2 border-green-600 z-10">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
           </div>
           
           {/* End Point (Home) */}
           <div className={`absolute top-[160px] left-[280px] p-2 rounded-full shadow-lg border-2 z-10 transition-colors duration-500 ${
               currentStatusNormalized === 'Delivered' ? 'bg-green-600 border-green-700' : 'bg-white border-red-500'
           }`}>
              <MapPin size={20} className={currentStatusNormalized === 'Delivered' ? 'text-white' : 'text-red-500'} fill="currentColor"/>
           </div>

           {/* Moving Bike Icon */}
           <div 
             className="absolute transition-all duration-[2000ms] linear z-20"
             style={{
                left: bikePosition.x - 24, // Adjust for icon center
                top: bikePosition.y - 24,
             }}
           >
              <div className="relative">
                  <img 
                    src="https://cdn-icons-png.flaticon.com/512/7543/7543163.png" 
                    alt="Delivery Partner" 
                    className="w-12 h-12 drop-shadow-lg"
                  />
                  
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap shadow-sm border border-black/10">
                      {currentStatusNormalized === 'Delivered' ? 'Arrived' : 'On the way'}
                  </div>
              </div>
           </div>
           
           <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-lg flex items-center space-x-2 z-10 border border-green-100">
              <Clock size={16} className={currentStatusNormalized === 'Delivered' ? "text-green-600" : "text-green-600 animate-pulse"}/>
              <div>
                 <p className="text-[10px] text-gray-500 font-bold uppercase">Estimated Arrival</p>
                 <p className="text-sm font-black text-gray-800 transition-all">
                    {eta}
                 </p>
              </div>
           </div>
        </div>
        )}

        {/* Delivery Partner Info - ONLY SHOWS IF Out for Delivery OR Delivered */}
        {showDeliveryPartner && (
        <div className="bg-white p-4 mb-2 shadow-sm animate-fade-in border-b border-gray-100">
           <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center border border-yellow-200 overflow-hidden relative">
                    <img 
                        src="https://cdn-icons-png.flaticon.com/512/4825/4825038.png" 
                        alt="Rider" 
                        className="w-full h-full object-cover"
                    />
                 </div>
                 <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">
                        {liveOrder.deliveryBoyName || 'Delivery Partner'}
                    </h3>
                    <p className="text-xs text-gray-500">Your Delivery Partner</p>
                    <div className="flex items-center space-x-1 mt-1">
                       <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-bold flex items-center">
                         4.8 ★
                       </span>
                       <span className="text-[10px] text-gray-400 flex items-center">
                          <ShieldCheck size={10} className="mr-0.5 text-green-600"/> Vaccinated
                       </span>
                    </div>
                 </div>
              </div>
              
              <div className="flex space-x-3">
                 {/* Call Button */}
                 {liveOrder.deliveryBoyPhone ? (
                     <a 
                       href={getPhoneLink(liveOrder.deliveryBoyPhone)}
                       className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-200 hover:bg-green-700 transition-colors animate-pulse"
                     >
                        <Phone size={20} fill="currentColor" />
                     </a>
                 ) : (
                     <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 cursor-not-allowed">
                        <Phone size={20} />
                     </button>
                 )}
              </div>
           </div>
        </div>
        )}

        {/* Vertical Timeline - CONNECTED LINE FIX */}
        {!isCancelled && !isReturned && (
        <div className="bg-white p-6 shadow-sm mb-2">
           <h3 className="text-sm font-bold text-gray-900 mb-6">Order Status</h3>
           <div className="relative ml-3 space-y-0">
              {STATUS_STEPS.slice(1).map((step, idx) => { 
                 const stepIdx = STATUS_STEPS.indexOf(step);
                 const isCompleted = currentStepIndex !== -1 && currentStepIndex >= stepIdx;
                 const isCurrent = currentStepIndex === stepIdx;
                 const isLast = idx === STATUS_STEPS.length - 2;

                 return (
                <div key={idx} className="relative pl-8 pb-8 last:pb-0">
                   {/* Vertical Connecting Line */}
                   {!isLast && (
                       <div className={`absolute left-[6px] top-4 w-[2px] h-full ${
                           isCompleted && currentStepIndex > stepIdx 
                             ? 'bg-green-600' 
                             : 'bg-gray-200'
                       }`}></div>
                   )}

                   {/* Dot */}
                   <div className={`absolute left-0 top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-white z-10 transition-colors duration-500 ${
                      isCompleted ? 'border-green-600' : 'border-gray-300'
                   }`}>
                      {isCompleted && <div className="w-2 h-2 bg-green-600 rounded-full"></div>}
                   </div>
                   
                   <div className="-mt-1">
                      <h4 className={`text-sm font-bold transition-colors duration-300 ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                         {step}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                          {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : 'Pending'}
                      </p>
                   </div>
                </div>
              )})}
           </div>
        </div>
        )}

        {/* Items Accordion */}
        <div className="bg-white shadow-sm mb-6">
           <button 
             onClick={() => setIsItemsOpen(!isItemsOpen)}
             className="w-full flex items-center justify-between p-4 focus:outline-none hover:bg-gray-50 transition-colors"
           >
              <div className="flex flex-col items-start">
                 <h3 className="text-sm font-bold text-gray-800">Items in this order</h3>
                 {!isItemsOpen && (
                    <span className="text-xs text-gray-500">{liveOrder.items.length} items • Total ₹{liveOrder.totalAmount}</span>
                 )}
              </div>
              {isItemsOpen ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
           </button>
           
           {isItemsOpen && (
              <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in">
                 {liveOrder.items.map((item, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => handleItemClick(item.productId)}
                        className="flex justify-between items-center mb-3 last:mb-0 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors"
                    >
                       <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded border border-gray-200 p-1 flex items-center justify-center">
                              <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply"/>
                          </div>
                          <div>
                              <p className="text-xs font-bold text-gray-800 line-clamp-1 w-40 hover:text-green-600">{item.name}</p>
                              <p className="text-[10px] text-gray-500">{item.quantity} x ₹{item.price}</p>
                          </div>
                       </div>
                       <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-gray-900">₹{item.price * item.quantity}</span>
                            <span className="text-[9px] text-green-600 font-bold uppercase">Buy Again</span>
                       </div>
                    </div>
                 ))}
                 <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-600">Bill Total</span>
                    <span className="text-sm font-black text-gray-900">₹{liveOrder.totalAmount}</span>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
