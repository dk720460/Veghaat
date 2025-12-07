

import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, Loader, MapPin } from 'lucide-react';
import { ref, onValue, set, get, update } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase';
import { APP_NAME, SEARCH_ITEMS, BANNERS as STATIC_BANNERS, MAIN_SECTIONS as STATIC_SECTIONS } from './constants';
import SearchBar from './components/SearchBar';
import CategoryBar from './components/CategoryBar';
import ProfileMenu from './components/ProfileMenu';
import ContactModal from './components/ContactModal';
import Banners from './components/Banners';
import DeliveryAnimation from './components/DeliveryAnimation';
import SectionList from './components/SectionList';
import ProductRail from './components/ProductRail';
import ProductListingPage from './components/ProductListingPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import CartPage from './components/CartPage';
import OrdersPage from './components/OrdersPage';
import CategoriesPage from './components/CategoriesPage';
import TrackingPage from './components/TrackingPage';
import AuthPage from './components/AuthPage';
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import ExitModal from './components/ExitModal';
import WelcomeHeader from './components/WelcomeHeader';
import ViewCartStickyBar from './components/ViewCartStickyBar'; // New Component
import { Product, Order, Banner, MainSection } from './types';

const App: React.FC = () => {
  // --- SPLASH SCREEN STATE ---
  const [showSplash, setShowSplash] = useState(true);

  // --- AUTH STATE ---
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- NAVIGATION STATE ---
  const [view, setView] = useState<'home' | 'listing' | 'details' | 'cart' | 'orders' | 'categories' | 'tracking' | 'address'>('home');
  
  // UI State - Moved up to avoid usage before declaration
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFooterTab, setActiveFooterTab] = useState('home');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(''); 

  // Use Refs to access current state inside event listeners
  const viewRef = useRef(view);
  const isProfileOpenRef = useRef(false);
  const isContactOpenRef = useRef(false);

  // Update refs when state changes
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { isProfileOpenRef.current = isProfileOpen; }, [isProfileOpen]);
  useEffect(() => { isContactOpenRef.current = isContactOpen; }, [isContactOpen]);
  
  // View Data Context
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Data State
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>(SEARCH_ITEMS);
  const [banners, setBanners] = useState<Banner[]>(STATIC_BANNERS);
  const [sections, setSections] = useState<MainSection[]>(STATIC_SECTIONS);
  const [orders, setOrders] = useState<Order[]>([]);

  const lastAddRef = useRef<number>(0);

  // --- 0. SPLASH TIMER ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // --- 1. AUTH & USER DATA ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
          const userRef = ref(db, `users/${currentUser.uid}`);
          try {
              const snapshot = await get(userRef);
              if (snapshot.exists()) {
                  const data = snapshot.val();
                  if (data.address && data.address.flat && data.address.area) {
                      setDeliveryAddress(`${data.address.flat}, ${data.address.area}`);
                      const localStorageData = { name: data.name, phone: data.phone, ...data.address };
                      localStorage.setItem('veghaat_user_address', JSON.stringify(localStorageData));
                  }
              }
          } catch (e) { console.error(e); }
      } else {
          setDeliveryAddress('');
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. FIREBASE DATA SYNC ---
  useEffect(() => {
    onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let allProducts: Product[] = [];
        const entries = Array.isArray(data) ? data.map((item, index) => [String(index), item]) : Object.entries(data);

        entries.forEach(([key, value]: [string, any]) => {
            if (value && typeof value === 'object') {
                 if (value.name && (value.price !== undefined || value.mrpPrice !== undefined)) {
                     if (value.isActive !== false) allProducts.push(mapFirebaseProductToApp(key, value));
                 } else {
                     Object.entries(value).forEach(([childKey, childValue]: [string, any]) => {
                         if (childValue && typeof childValue === 'object' && childValue.isActive !== false) {
                                allProducts.push(mapFirebaseProductToApp(childKey, childValue));
                         }
                     });
                 }
            }
        });
        setProducts(allProducts);
      }
    });

    onValue(ref(db, 'banners'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        let formattedBanners: Banner[] = [];
        if (Array.isArray(data)) {
            formattedBanners = data.filter(b => b).map((b, i) => ({ id: b.id || i, image: b.image || b.imageUrl || b.url || b.img || '', linkTo: b.linkTo || 'home' }));
        } else {
            formattedBanners = Object.entries(data).map(([key, value]: [string, any]) => ({ id: key, image: value.image || value.imageUrl || value.url || value.img || '', linkTo: value.linkTo || 'home' }));
        }
        setBanners(formattedBanners.filter(b => b.image));
      }
    });

    onValue(ref(db, 'sections'), (snapshot) => {
      const data = snapshot.val();
      if (data) setSections(Array.isArray(data) ? data : Object.values(data) as MainSection[]);
    });
  }, []);

  const mapFirebaseProductToApp = (id: string, p: any): Product => {
      const price = Number(p.price) || 0;
      const mrpPrice = p.mrpPrice ? Number(p.mrpPrice) : undefined;
      const originalPrice = mrpPrice || p.originalPrice; 
      
      let discount = '';
      if (p.discountPercentage && Number(p.discountPercentage) > 0) discount = `${p.discountPercentage}% OFF`;
      else if (p.discount) {
          const d = String(p.discount).trim();
          if (!d.includes('OFF') && !isNaN(Number(d))) discount = `${d}% OFF`;
          else discount = d;
      } else if (originalPrice && originalPrice > price) {
           const calcPerc = Math.round(((originalPrice - price) / originalPrice) * 100);
           if (calcPerc > 0) discount = `${calcPerc}% OFF`;
      }

      const imageList: string[] = [];
      if (p.img) imageList.push(p.img);
      if (p.img2) imageList.push(p.img2);
      if (p.img3) imageList.push(p.img3);
      if (p.image) imageList.push(p.image);
      
      if (p.galleryImages && typeof p.galleryImages === 'object') {
          if (p.galleryImages.img1) imageList.push(p.galleryImages.img1);
          if (p.galleryImages.img2) imageList.push(p.galleryImages.img2);
          if (p.galleryImages.img3) imageList.push(p.galleryImages.img3);
      }
      
      const uniqueImages = Array.from(new Set(imageList)).filter(url => url?.length > 0);
      const rawCategory = p.subCategory || p.groupCategory || p.category || 'Uncategorized';

      return {
          id: id, 
          name: p.name || 'Unknown Item',
          price: price,
          originalPrice: originalPrice,
          image: uniqueImages[0] || 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png',
          images: uniqueImages,
          category: String(rawCategory).trim(),
          weight: p.unit || p.weight || '1 unit', 
          discount: discount,
          eta: '20 MINS', 
          details: p.shortDescription || p.description || p.details || ''
      };
  };

  useEffect(() => {
    if (!user) { setOrders([]); return; }
    return onValue(ref(db, 'orders'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allOrders = Object.values(data) as Order[];
        setOrders(allOrders.filter(o => o.userId === user.uid).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } else { setOrders([]); }
    });
  }, [user]);

  // --- 3. PROFESSIONAL BACK NAVIGATION LOGIC ---
  useEffect(() => {
    // 1. Initialize History State for trapping
    if (!window.history.state || window.history.state.view !== 'home') {
        window.history.replaceState({ view: 'home' }, '');
        window.history.pushState({ view: 'home' }, ''); // Duplicate to create a buffer
    }

    const handlePopState = (event: PopStateEvent) => {
        // A. Handle Modals
        if (isProfileOpenRef.current) {
            setIsProfileOpen(false);
            // Push current view back to history so we don't change view, just close modal
            window.history.pushState({ view: viewRef.current }, '');
            return;
        }
        if (isContactOpenRef.current) {
            setIsContactOpen(false);
            window.history.pushState({ view: viewRef.current }, '');
            return;
        }

        // B. Handle Home Exit Trap
        if (viewRef.current === 'home') {
             setShowExitConfirmation(true);
             // Push state back so we don't actually leave yet
             window.history.pushState({ view: 'home' }, '');
             return;
        }

        // C. Standard Navigation
        if (event.state && event.state.view) {
            const nextView = event.state.view;
            setView(nextView);
            
            if (event.state.category) setSelectedCategoryTitle(event.state.category);
            if (event.state.product) setSelectedProduct(event.state.product);
            if (event.state.order) setSelectedOrder(event.state.order);

            // Sync Footer
            if (nextView === 'home') setActiveFooterTab('home');
            else if (nextView === 'cart' || nextView === 'address') setActiveFooterTab('cart');
            else if (nextView === 'orders' || nextView === 'tracking') setActiveFooterTab('orders');
            else if (nextView === 'categories') setActiveFooterTab('categories');
            // Listing and Details keep prev tab or default to home/category
            else if (nextView === 'listing') setActiveFooterTab('categories');
        } else {
            // Fallback to home if stack is lost
            setView('home');
            setActiveFooterTab('home');
        }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- 4. NAVIGATION METHODS ---
  const pushView = (newView: string, stateData: any = {}) => {
      try {
          window.history.pushState({ view: newView, ...stateData }, '', '');
      } catch (e) {}
      setView(newView as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => { if (view !== 'home') { pushView('home'); setActiveFooterTab('home'); } };
  const handleSearchClick = () => navigateToHome();
  const navigateToListing = (categoryTitle: string) => { setSelectedCategoryTitle(categoryTitle); pushView('listing', { category: categoryTitle }); };
  const navigateToDetails = (product: Product) => { setSelectedProduct(product); pushView('details', { product }); };
  const navigateToCart = () => { pushView('cart'); setActiveFooterTab('cart'); };
  const navigateToAddress = () => { pushView('address'); };
  const navigateToOrders = () => { pushView('orders'); setActiveFooterTab('orders'); };
  const navigateToCategories = () => { pushView('categories'); setActiveFooterTab('categories'); };
  const navigateToTracking = (order: Order) => { setSelectedOrder(order); pushView('tracking', { order }); };

  // Manual Back Button Handler (Top Left UI Button)
  const handleBack = () => {
      // 1. Close Modals first if open
      if (isProfileOpen) { setIsProfileOpen(false); return; }
      if (isContactOpen) { setIsContactOpen(false); return; }

      // 2. Blur any active inputs (closes keyboard)
      if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
      }

      // 3. Navigation
      if (view === 'home') {
          setShowExitConfirmation(true);
      } else {
          window.history.back();
      }
  };

  const handleExitApp = () => {
    try {
        window.history.go(-2); // Try to go back past the trap
    } catch(e) {}
    setShowExitConfirmation(false);
  };

  // --- 5. CART & ORDER ACTIONS ---
  const handleUpdateQuantity = (e: React.MouseEvent, product: Product, delta: number) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastAddRef.current < 200) return; 
    lastAddRef.current = now;

    setCartItems(prev => {
      const currentQty = prev[product.id] || 0;
      const newQty = Math.max(0, currentQty + delta);
      if (newQty === 0) {
        const { [product.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [product.id]: newQty };
    });

    if (delta > 0) {
       // 1. Create Drop Animation (Golden Falling product)
       const drop = document.createElement('img');
       drop.src = product.image;
       drop.className = 'animate-drop'; // CSS in index.html makes this golden bordered
       drop.style.setProperty('--start-x', `${e.clientX}px`);
       drop.style.setProperty('--start-y', `${e.clientY}px`);
       document.body.appendChild(drop);
       
       // Cleanup drop element
       setTimeout(() => drop.remove(), 550);

       // 2. Create Impact Bubble Animation (Rising from bottom like Blinkit)
       // Timing matched to when drop finishes falling
       setTimeout(() => {
           const impact = document.createElement('div');
           impact.className = 'impact-bubble'; // CSS in index.html handles the pop-up
           impact.innerHTML = '+1'; // Text inside bubble
           document.body.appendChild(impact);
           
           // Cleanup impact element
           setTimeout(() => impact.remove(), 850);
       }, 500);
    }
  };

  const handlePlaceOrder = (newOrder: Order) => {
      if (!user) return;
      newOrder.userId = user.uid;
      set(ref(db, `orders/${newOrder.id}`), newOrder)
      .then(() => setCartItems({}))
      .catch(err => console.error(err));
  };

  const handleAddressSave = (addressString: string) => {
      setDeliveryAddress(addressString);
      if (user) {
         update(ref(db, `users/${user.uid}/address`), { 
             flat: addressString.split(',')[0].trim(),
             area: addressString.split(',').slice(1).join(',').trim()
         });
      }
  };

  const handleProfileMenuSelect = (item: string) => {
    setIsProfileOpen(false);
    if (item === 'orders') navigateToOrders();
    else if (item === 'contact') setIsContactOpen(true);
    else if (item === 'address') navigateToAddress();
    else if (item === 'logout') { setUser(null); setDeliveryAddress(''); navigateToHome(); }
  };

  // Derived Data
  const totalItems = (Object.values(cartItems) as number[]).reduce((sum, qty) => sum + qty, 0);
  const cartTotalPrice = Object.entries(cartItems).reduce((sum, [id, qty]) => {
      const product = products.find(p => p.id === id);
      return sum + (product ? (product.price * qty) : 0);
  }, 0);
  
  const vegProducts = products.filter(p => p.category.toLowerCase().match(/veg|fruit/)).slice(0, 12);
  const drinkProducts = products.filter(p => p.category.toLowerCase().match(/drink|juice|tea|coffee/)).slice(0, 12);
  const stapleProducts = products.filter(p => p.category.toLowerCase().match(/atta|aata|rice|dal|oil|masala/)).slice(0, 12);
  const careProducts = products.filter(p => p.category.toLowerCase().match(/bath|baby|care|clean/)).slice(0, 15);

  if (showSplash) return <SplashScreen />;

  if (authLoading) return <div className="h-screen w-full flex items-center justify-center bg-[#F5F5F5]"><Loader className="animate-spin text-green-600" size={32} /></div>;
  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen pb-24 relative w-full bg-[#F4F6F8] overflow-x-hidden">
      
      <ProfileMenu 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onSelect={handleProfileMenuSelect}
        user={user}
      />

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      
      <ExitModal 
        isOpen={showExitConfirmation} 
        onClose={() => setShowExitConfirmation(false)} 
        onConfirm={handleExitApp} 
      />

      {view === 'home' && (
        <>
           {/* FIXED HEADER (Includes Logo, Search, AND Categories) */}
           <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm transition-all duration-300 border-b border-gray-100 w-full rounded-b-xl">
               <header className="px-4 py-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-green-600 tracking-tight flex items-center">
                      {APP_NAME} 
                      <span className="ml-2 text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        20 mins
                      </span>
                    </h1>
                    <div className="flex items-center space-x-1 mt-0.5 cursor-pointer active:opacity-70" onClick={navigateToAddress}>
                      <span className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[200px]">
                        {deliveryAddress ? deliveryAddress.split(',')[0] : 'Select Location'}
                      </span>
                      <ChevronDown size={14} className="text-green-600" />
                    </div>
                    {deliveryAddress && (
                        <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[220px]">
                            {deliveryAddress}
                        </p>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="p-2.5 bg-gray-50 rounded-full text-green-700 hover:bg-green-100 transition-colors shadow-sm"
                  >
                    <User size={22} />
                  </button>
               </header>
               <SearchBar products={products} onProductClick={navigateToDetails} />
               
               {/* CATEGORY BAR INTEGRATED INTO HEADER */}
               <CategoryBar 
                  activeCategory={activeCategory} 
                  onSelectCategory={(id, target) => { 
                      setActiveCategory(id);
                      if(target === 'top') {
                          window.scrollTo({top: 0, behavior: 'smooth'});
                      } else {
                          navigateToListing(target);
                      }
                  }} 
               />
           </div>

           {/* MAIN SCROLLABLE CONTENT - Increased Padding for Taller Header */}
           <div className="pt-[240px] w-full max-w-[100vw] overflow-x-hidden">
               
               {/* 1. WELCOME HEADER (First item in scroll) */}
               <WelcomeHeader />
               
               {/* 2. BANNERS */}
               <Banners banners={banners} onBannerClick={() => navigateToListing('Best Sellers')} />

               {/* 3. DELIVERY ANIMATION */}
               <DeliveryAnimation />

               {/* 4. SECTIONS GRID */}
               <SectionList sections={sections} onCategoryClick={navigateToListing} />

               {/* 5. PRODUCT RAILS */}
               <ProductRail 
                  title="Fresh Vegetables & Fruits" 
                  products={vegProducts} 
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onProductClick={navigateToDetails}
                  onCategoryClick={() => navigateToListing('Vegetables & Fruit')}
               />

               <ProductRail 
                  title="Atta, Rice & Dal" 
                  products={stapleProducts} 
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onProductClick={navigateToDetails}
                  onCategoryClick={() => navigateToListing('Atta Rice & Dal')}
                  bgColor="bg-[#F8F9FA]"
               />

               <ProductRail 
                  title="Cold Drinks & Juices" 
                  products={drinkProducts} 
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onProductClick={navigateToDetails}
                  onCategoryClick={() => navigateToListing('Drinks & Juices')}
               />
               
               <ProductRail 
                  title="Household & Personal Care" 
                  products={careProducts} 
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onProductClick={navigateToDetails}
                  onCategoryClick={() => navigateToListing('Personal Care & Beauty')}
                  bgColor="bg-[#F8F9FA]"
               />
               
               {/* Bottom Spacing for Floating Nav */}
               <div className="h-20"></div>
           </div>
        </>
      )}

      {view === 'listing' && (
        <ProductListingPage 
           title={selectedCategoryTitle} 
           onBack={handleBack}
           cartItems={cartItems}
           onUpdateQuantity={handleUpdateQuantity}
           onProductClick={navigateToDetails}
           products={products}
           onSearchClick={handleSearchClick}
        />
      )}

      {view === 'details' && selectedProduct && (
        <ProductDetailsPage 
           product={selectedProduct} 
           onBack={handleBack}
           cartItems={cartItems}
           onUpdateQuantity={handleUpdateQuantity}
           onProductClick={navigateToDetails}
           products={products}
           onSearchClick={handleSearchClick}
        />
      )}

      {(view === 'cart' || view === 'address') && (
        <CartPage 
           onBack={handleBack}
           cartItems={cartItems}
           onUpdateQuantity={handleUpdateQuantity}
           onPlaceOrder={handlePlaceOrder}
           products={products}
           onAddressSave={handleAddressSave}
           initialStep={view === 'address' ? 'address' : 'cart'}
        />
      )}

      {view === 'orders' && (
        <OrdersPage 
           orders={orders}
           products={products}
           onBack={handleBack}
           onReorder={(order) => {
               setCartItems(prev => {
                   const newCart = { ...prev };
                   order.items.forEach(item => {
                       newCart[item.productId] = (newCart[item.productId] || 0) + item.quantity;
                   });
                   return newCart;
               });
               navigateToCart();
           }}
           onTrackOrder={navigateToTracking}
           onProductClick={navigateToDetails}
        />
      )}

      {view === 'tracking' && selectedOrder && (
         <TrackingPage 
            order={selectedOrder}
            products={products}
            onBack={handleBack}
            onProductClick={navigateToDetails}
         />
      )}

      {view === 'categories' && (
        <CategoriesPage 
           onBack={handleBack}
           onCategoryClick={navigateToListing}
           onSearchClick={handleSearchClick}
        />
      )}

      {/* FLOATING GREEN CART BAR (Visible only when items exist and NOT in Cart/Checkout page) */}
      {totalItems > 0 && view !== 'cart' && view !== 'address' && (
         <ViewCartStickyBar 
            itemCount={totalItems} 
            totalPrice={cartTotalPrice} 
            onViewCart={navigateToCart} 
         />
      )}

      {/* FOOTER: Always Visible on Authenticated Pages */}
      <Footer 
        cartCount={totalItems} 
        activeTab={activeFooterTab} 
        onTabSelect={(tab) => {
            if(tab === 'home') navigateToHome();
            if(tab === 'categories') navigateToCategories();
            if(tab === 'orders') navigateToOrders();
            if(tab === 'cart') navigateToCart();
        }} 
      />
    </div>
  );
};

export default App;