

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Share2, Minus, Plus, ShoppingBag, MapPin, Home, Briefcase, ChevronRight, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { Product, Order, OrderItem } from '../types';

interface CartPageProps {
  onBack: () => void;
  cartItems: Record<string, number>;
  onUpdateQuantity: (e: React.MouseEvent, product: Product, delta: number) => void;
  onPlaceOrder: (order: Order) => void;
  products: Product[];
  onAddressSave: (address: string) => void;
  initialStep?: 'cart' | 'address';
}

type CheckoutStep = 'cart' | 'address' | 'payment' | 'success';

interface AddressData {
  name: string;
  phone: string;
  flat: string;
  area: string;
  type: 'Home' | 'Work' | 'Other';
}

const CartPage: React.FC<CartPageProps> = ({ 
  onBack, 
  cartItems, 
  onUpdateQuantity, 
  onPlaceOrder, 
  products, 
  onAddressSave,
  initialStep = 'cart'
}) => {
  const [step, setStep] = useState<CheckoutStep>(initialStep);
  const [address, setAddress] = useState<AddressData>({
    name: '',
    phone: '',
    flat: '',
    area: '',
    type: 'Home'
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);

  // Sync step with prop change if it changes (e.g. navigation via profile)
  useEffect(() => {
     setStep(initialStep);
  }, [initialStep]);

  const isAddressMode = initialStep === 'address';

  // Load saved address from LocalStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('veghaat_user_address');
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        setAddress(parsed);
        // Also update the global address state if valid
        if (parsed.flat && parsed.area) {
             onAddressSave(`${parsed.flat}, ${parsed.area}`);
        }
      } catch (e) {
        console.error("Failed to parse saved address");
      }
    }
  }, []);

  const cartProductIds = Object.keys(cartItems);
  const totalItems = (Object.values(cartItems) as number[]).reduce((sum, qty) => sum + qty, 0);

  const calculateTotal = () => {
    return cartProductIds.reduce((sum, id) => {
      const item = (products || []).find(p => p.id === id);
      const qty = cartItems[id] || 0;
      return sum + (item ? Number(item.price) * qty : 0);
    }, 0);
  };

  const itemTotal = calculateTotal();
  const handlingCharge = 5; // Platform Fee
  const deliveryCharge = 0; // Free Delivery
  const toPay = itemTotal + handlingCharge + deliveryCharge;

  // Recommendations (exclude items already in cart)
  const recommendations = (products || []).filter(item => !cartItems[item.id]).slice(0, 5);

  // --- PROFESSIONAL BACK NAVIGATION FOR CART FLOW ---
  const handleInternalBack = () => {
    if (step === 'success') {
      onBack(); // Go home
    } else if (step === 'payment') {
      // If we are on Payment step, go back to Cart (or Address if needed, but Cart is standard)
      setStep('cart'); 
    } else if (step === 'address') {
      if (isAddressMode) {
          onBack(); // Back to Profile/Home if entered via "Address" menu
      } else {
          setStep('cart'); // Back to Cart if in checkout flow
      }
    } else {
      // If on Cart step, go back to previous screen (Home/Details)
      onBack();
    }
  };

  // Smart Proceed Logic
  const handleProceedFromCart = () => {
      // Check if address is valid in state (loaded from localstorage)
      if (address.name && address.phone && address.flat && address.area) {
          setStep('payment'); // Skip Address Step if address exists
      } else {
          setStep('address'); // Go to Address Step if missing
      }
  };

  const handleAddressSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.flat || !address.area) {
      alert("Please fill all address fields");
      return;
    }
    
    // Save to LocalStorage
    localStorage.setItem('veghaat_user_address', JSON.stringify(address));

    // Update global address state in App.tsx
    onAddressSave(`${address.flat}, ${address.area}`);

    if (isAddressMode) {
        alert("Address saved successfully!");
        onBack();
    } else {
        setStep('payment');
    }
  };

  const handlePlaceOrder = () => {
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    
    // CAPTURE THE FINAL TOTAL BEFORE CART IS CLEARED
    setFinalTotal(toPay);

    // Construct Order Object with strict safety checks for undefined values
    const orderItems: OrderItem[] = cartProductIds.map(id => {
      const item = (products || []).find(p => p.id === id);
      return {
        productId: id,
        quantity: cartItems[id] || 0,
        price: item ? Number(item.price) : 0,
        name: item?.name || 'Unknown Item',
        image: item?.image || '',
        weight: item?.weight || '' 
      };
    }).filter(i => i.price > 0);

    // Generate a robust ID based on timestamp + random to ensure admin panel sorting
    const timestamp = Date.now();
    const orderId = `${timestamp}`;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString(),
      status: 'Processing', // Start with Processing
      items: orderItems,
      totalAmount: toPay, // Ensures the full amount (with handling charge) is sent to Firebase
      address: `${address.flat}, ${address.area}`
    };

    // Simulate short delay for better UX or actual async operation
    setTimeout(() => {
        onPlaceOrder(newOrder);
        setStep('success');
        setIsSubmitting(false);
    }, 500);
  };

  // --- RENDER SUCCESS VIEW ---
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="bg-green-100 p-6 rounded-full mb-6 animate-scale-up">
           <CheckCircle size={64} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 text-center mb-8">
          Your order will be delivered to <br/>
          <span className="font-semibold text-gray-800">{address.flat}, {address.area}</span> <br/>
          in 20 minutes.
        </p>
        
        <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
           <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 text-sm">Total Amount</span>
              <span className="font-bold text-gray-900">₹{finalTotal}</span>
           </div>
           <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Payment Mode</span>
              <span className="font-bold text-gray-900 uppercase">{paymentMethod}</span>
           </div>
        </div>

        <button 
          onClick={onBack}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform"
        >
          Go to Home
        </button>
      </div>
    );
  }

  // --- RENDER EMPTY CART ---
  if (cartProductIds.length === 0 && step === 'cart') {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F7FD] flex flex-col items-center justify-center">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
            <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items to start shopping</p>
        <button 
          onClick={onBack}
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-200 active:scale-95 transition-transform"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const hasSavedAddress = address.name && address.phone && address.flat && address.area;

  return (
    <div className="fixed inset-0 z-[60] bg-[#F5F7FD] flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={handleInternalBack} className="p-3 -ml-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95">
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-gray-900 leading-none">
              {step === 'cart' ? 'Checkout' : step === 'address' ? (isAddressMode ? 'Manage Address' : 'Add Address') : 'Payment'}
            </h1>
            {step === 'cart' && <p className="text-xs text-gray-500 mt-0.5">{totalItems} Items</p>}
          </div>
        </div>
        {step === 'cart' && (
          <button className="flex items-center space-x-1 text-green-700 font-bold text-sm">
             <Share2 size={16} /> <span>Share</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-48 no-scrollbar">
        
        {/* --- STEP 1: CART REVIEW --- */}
        {step === 'cart' && (
          <>
            {/* Delivery Time Banner */}
            <div className="m-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                    <Clock size={24} className="text-green-700" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Delivery in 20 minutes</h2>
                    <p className="text-xs text-gray-500 mt-1">Shipment of {totalItems} items</p>
                </div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white mx-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {cartProductIds.map((id, index) => {
                    const item = (products || []).find(p => p.id === id);
                    if (!item) return null;
                    const qty = cartItems[id] || 0;
                    const price = Number(item.price);

                    return (
                        <div key={id} className={`flex items-center p-4 ${index !== 0 ? 'border-t border-gray-50' : ''}`}>
                            <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center mr-4">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{item.weight || '1 kg'}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                <div className="flex items-center bg-green-600 text-white rounded-lg shadow-sm h-8">
                                    <button 
                                      onClick={(e) => onUpdateQuantity(e, item, -1)}
                                      className="w-8 h-full flex items-center justify-center hover:bg-green-700 rounded-l-lg active:scale-95"
                                    >
                                        <Minus size={14} strokeWidth={3} />
                                    </button>
                                    <span className="text-sm font-bold w-6 text-center">{qty}</span>
                                    <button 
                                      onClick={(e) => onUpdateQuantity(e, item, 1)}
                                      className="w-8 h-full flex items-center justify-center hover:bg-green-700 rounded-r-lg active:scale-95"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                    </button>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-bold text-gray-900">₹{price * qty}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bill Details */}
            <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Bill Details</h3>
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Item Total</span>
                    <span>₹{itemTotal}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Platform Fee</span>
                    <span>₹{handlingCharge}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold text-gray-900">
                    <span>To Pay</span>
                    <span>₹{toPay}</span>
                </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 mb-2 px-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">You might also like</h3>
                <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                    {recommendations.map((item) => (
                        <div key={item.id} className="min-w-[140px] w-[140px] bg-white rounded-xl border border-gray-100 p-2 shadow-sm flex flex-col justify-between">
                             <div className="relative h-24 mb-2">
                                 <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                             </div>
                             <div>
                                 <h4 className="text-xs font-bold text-gray-800 line-clamp-2 h-8 leading-tight mb-2">{item.name}</h4>
                                 <div className="flex items-center justify-between mt-auto">
                                     <div>
                                         <p className="text-xs font-bold text-gray-900">₹{item.price}</p>
                                     </div>
                                     <button 
                                       onClick={(e) => onUpdateQuantity(e, item, 1)}
                                       className="bg-white border border-green-600 text-green-700 text-[10px] font-bold px-3 py-1 rounded shadow-sm hover:bg-green-50 uppercase"
                                     >
                                        ADD
                                     </button>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
          </>
        )}

        {/* --- STEP 2: ADDRESS INPUT --- */}
        {step === 'address' && (
           <div className="p-4 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="text-sm font-bold text-gray-900 mb-4">Contact Details</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Name *</label>
                       <input 
                         type="text" 
                         value={address.name}
                         onChange={(e) => setAddress({...address, name: e.target.value})}
                         className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-green-500 focus:bg-white outline-none text-sm text-gray-900 font-medium transition-all"
                         placeholder="Enter your name"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number *</label>
                       <input 
                         type="tel" 
                         value={address.phone}
                         onChange={(e) => setAddress({...address, phone: e.target.value})}
                         className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-green-500 focus:bg-white outline-none text-sm text-gray-900 font-medium transition-all"
                         placeholder="10 digit mobile number"
                       />
                    </div>
                 </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="text-sm font-bold text-gray-900 mb-4">Address Details</h3>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Flat / House No / Building *</label>
                       <input 
                         type="text" 
                         value={address.flat}
                         onChange={(e) => setAddress({...address, flat: e.target.value})}
                         className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-green-500 focus:bg-white outline-none text-sm text-gray-900 font-medium transition-all"
                         placeholder="e.g. Flat 402, Sunshine Apts"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Area / Sector / Locality *</label>
                       <input 
                         type="text" 
                         value={address.area}
                         onChange={(e) => setAddress({...address, area: e.target.value})}
                         className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-green-500 focus:bg-white outline-none text-sm text-gray-900 font-medium transition-all"
                         placeholder="e.g. Unakoti, Tripura"
                       />
                    </div>
                    
                    <div>
                       <label className="block text-xs font-medium text-gray-500 mb-2">Save as</label>
                       <div className="flex space-x-3">
                          {['Home', 'Work', 'Other'].map((t) => (
                             <button
                               key={t}
                               onClick={() => setAddress({...address, type: t as any})}
                               className={`flex items-center space-x-1 px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                                  address.type === t 
                                  ? 'bg-green-600 text-white border-green-600' 
                                  : 'bg-white text-gray-600 border-gray-200'
                               }`}
                             >
                                {t === 'Home' && <Home size={12}/>}
                                {t === 'Work' && <Briefcase size={12}/>}
                                {t === 'Other' && <MapPin size={12}/>}
                                <span>{t}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* --- STEP 3: PAYMENT --- */}
        {step === 'payment' && (
           <div className="p-4 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="text-sm font-bold text-gray-900 mb-4">Preferred Payment</h3>
                 
                 <div 
                   onClick={() => setPaymentMethod('upi')}
                   className={`flex items-center justify-between p-4 rounded-xl border mb-3 cursor-pointer transition-all ${
                     paymentMethod === 'upi' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                   }`}
                 >
                    <div className="flex items-center space-x-3">
                       <div className="bg-white p-2 rounded-full border border-gray-100">
                          <CreditCard size={20} className="text-gray-700"/>
                       </div>
                       <div>
                          <p className="font-bold text-sm text-gray-800">UPI / Cards</p>
                          <p className="text-[10px] text-gray-500">Google Pay, PhonePe, Paytm, Cards</p>
                       </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                       paymentMethod === 'upi' ? 'border-green-600' : 'border-gray-300'
                    }`}>
                       {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>}
                    </div>
                 </div>

                 <div 
                   onClick={() => setPaymentMethod('cod')}
                   className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                     paymentMethod === 'cod' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                   }`}
                 >
                    <div className="flex items-center space-x-3">
                       <div className="bg-white p-2 rounded-full border border-gray-100">
                          <Banknote size={20} className="text-gray-700"/>
                       </div>
                       <div>
                          <p className="font-bold text-sm text-gray-800">Cash on Delivery</p>
                          <p className="text-[10px] text-gray-500">Pay cash to delivery partner</p>
                       </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                       paymentMethod === 'cod' ? 'border-green-600' : 'border-gray-300'
                    }`}>
                       {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>}
                    </div>
                 </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="text-sm font-bold text-gray-900 mb-2">Deliver to</h3>
                 <div className="flex items-start space-x-2">
                    <Home size={16} className="text-gray-400 mt-0.5" />
                    <div>
                       <p className="text-sm font-semibold text-gray-800">{address.name}</p>
                       <p className="text-xs text-gray-500 mt-1">
                          {address.flat}, {address.area}
                       </p>
                       <p className="text-xs text-gray-500 mt-0.5">{address.phone}</p>
                       <button onClick={() => setStep('address')} className="text-xs font-bold text-green-700 mt-2 uppercase">Change Address</button>
                    </div>
                 </div>
              </div>
           </div>
        )}

      </div>

      {/* --- PROFESSIONAL STICKY FOOTER ACTION BUTTON --- */}
      {/* Positioned at bottom-16 to sit exactly ON TOP of the main navigation footer (h-16) */}
      <div className="fixed bottom-16 left-0 right-0 z-[120] bg-white border-t border-gray-100 p-4 pb-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] w-full">
          {step === 'cart' && (
               <button 
                 onClick={handleProceedFromCart}
                 className="w-full bg-green-600 text-white font-bold text-lg py-3.5 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-between px-6"
               >
                  <div className="flex flex-col items-start leading-none">
                      <span className="text-sm font-semibold">₹{toPay}</span>
                      <span className="text-[10px] text-green-100 font-medium uppercase">Total</span>
                  </div>
                  <span className="flex items-center">
                      {hasSavedAddress ? 'Proceed to Pay' : 'Proceed to Address'} <ArrowLeft className="rotate-180 ml-2" size={18} />
                  </span>
               </button>
          )}

          {step === 'address' && (
             <button 
                 onClick={handleAddressSave}
                 className="w-full bg-green-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform"
             >
               {isAddressMode ? 'Save Address' : 'Save Address & Proceed'}
             </button>
          )}

          {step === 'payment' && (
             <button 
               onClick={handlePlaceOrder}
               disabled={isSubmitting}
               className={`w-full text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center justify-center space-x-2 ${
                   isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600'
               }`}
             >
               <span>{isSubmitting ? 'Processing...' : 'Place Order'}</span>
               <span className="bg-green-700 px-2 py-0.5 rounded text-sm">₹{toPay}</span>
             </button>
          )}
      </div>
    </div>
  );
};

export default CartPage;
