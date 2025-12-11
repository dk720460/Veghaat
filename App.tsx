
import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, Loader, MapPin, Wifi } from 'lucide-react';
import { ref, onValue, set, get } from 'firebase/database';
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
import Footer from './components/Footer';
import SplashScreen from './components/SplashScreen';
import ExitModal from './components/ExitModal';
import WelcomeHeader from './components/WelcomeHeader';
import ViewCartStickyBar from './components/ViewCartStickyBar';
import OfflineNotice from './components/OfflineNotice';
import { Product, Order, Banner, MainSection } from './types';

// Page Imports
import ProductListingPage from './components/ProductListingPage';
import ProductDetailsPage from './components/ProductDetailsPage';
import CartPage from './components/CartPage';
import OrdersPage from './components/OrdersPage';
import CategoriesPage from './components/CategoriesPage';
import TrackingPage from './components/TrackingPage';
import AuthPage from './components/AuthPage';

const App: React.FC = () => {
  // --- STATE ---
  const [showSplash, setShowSplash] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Navigation
  const [view, setView] = useState<'home' | 'listing' | 'details' | 'cart' | 'orders' | 'categories' | 'tracking' | 'address' | 'auth'>('home');
  const [activeFooterTab, setActiveFooterTab] = useState('home');

  // UI Toggles
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Data State
  const [deliveryAddress, setDeliveryAddress] = useState<string>(''); 
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);

  // Safe Initialization with Error Handling
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('products_cache');
      return cached ? JSON.parse(cached) : SEARCH_ITEMS;
    } catch { return SEARCH_ITEMS; }
  });
  
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const cached = localStorage.getItem('banners_cache');
      return cached ? JSON.parse(cached) : STATIC_BANNERS;
    } catch { return STATIC_BANNERS; }
  });

  const [sections, setSections] = useState<MainSection[]>(() => {
    try {
      const cached = localStorage.getItem('sections_cache');
      return cached ? JSON.parse(cached) : STATIC_SECTIONS;
    } catch { return STATIC_SECTIONS; }
  });

  const lastAddRef = useRef<number>(0);
  const viewRef = useRef(view);
  const isProfileOpenRef = useRef(isProfileOpen);
  const isContactOpenRef = useRef(isContactOpen);

  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { isProfileOpenRef.current = isProfileOpen; }, [isProfileOpen]);
  useEffect(() => { isContactOpenRef.current = isContactOpen; }, [isContactOpen]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // --- AUTH & USER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
          setUser(currentUser);
          if (viewRef.current === 'auth') {
             setView('home');
             setActiveFooterTab('home');
          }
          // Fetch Address
          try {
            const snap = await get(ref(db, `users/${currentUser.uid}`));
            if (snap.exists()) {
                const data = snap.val();
                if (data.address?.flat && data.address?.area) {
                    setDeliveryAddress(`${data.address.flat}, ${data.address.area}`);
                    localStorage.setItem('veghaat_user_address', JSON.stringify({name: data.name, phone: data.phone, ...data.address}));
                }
            }
          } catch (e) { console.error("User fetch error", e); }
      } else {
          // Guest Mode
          let guestId = localStorage.getItem('guest_uid');
          if (!guestId) {
              guestId = `guest_${Date.now()}`;
              localStorage.setItem('guest_uid', guestId);
          }
          setUser({ uid: guestId, displayName: 'Guest', isGuest: true });
          
          try {
             const saved = localStorage.getItem('veghaat_user_address');
             if(saved) {
                 const p = JSON.parse(saved);
                 if(p.flat) setDeliveryAddress(`${p.flat}, ${p.area}`);
             }
          } catch {}
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- DATA SYNC ---
  useEffect(() => {
    // Products
    const unsubProd = onValue(ref(db, 'products'), (snap) => {
      const data = snap.val();
      if (data) {
        const list: Product[] = [];
        const process = (obj: any, idPrefix: string) => {
             if(obj.name && (obj.price || obj.mrpPrice)) {
                 list.push(mapProduct(idPrefix, obj));
             } else {
                 Object.entries(obj).forEach(([k, v]) => process(v, k));
             }
        };
        // Handle array or object structure
        if(Array.isArray(data)) data.forEach((item, i) => process(item, String(i)));
        else Object.entries(data).forEach(([k, v]) => process(v, k));
        
        if(list.length > 0) {
            setProducts(list);
            localStorage.setItem('products_cache', JSON.stringify(list));
        }
      }
    });

    // Banners
    const unsubBan = onValue(ref(db, 'banners'), (snap) => {
        const data = snap.val();
        if(data) {
            const list = (Array.isArray(data) ? data : Object.values(data))
                .map((b: any, i) => ({ id: b.id || i, image: b.image || b.imageUrl || b.url || '', linkTo: b.linkTo || 'home' }))
                .filter(b => b.image);
            setBanners(list);
            localStorage.setItem('banners_cache', JSON.stringify(list));
        }
    });

    // Sections
    const unsubSec = onValue(ref(db, 'sections'), (snap) => {
        const data = snap.val();
        if(data) {
            const list = Array.isArray(data) ? data : Object.values(data);
            setSections(list as MainSection[]);
            localStorage.setItem('sections_cache', JSON.stringify(list));
        }
    });

    return () => { unsubProd(); unsubBan(); unsubSec(); };
  }, []);

  // Fetch Orders
  useEffect(() => {
      if(!user) { setOrders([]); return; }
      const unsub = onValue(ref(db, 'orders'), (snap) => {
          const data = snap.val();
          if(data) {
              const list = Object.values(data) as Order[];
              setOrders(list.filter(o => o.userId === user.uid).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }
      });
      return () => unsub();
  }, [user]);

  const mapProduct = (id: string, p: any): Product => {
      const price = Number(p.price) || 0;
      const originalPrice = Number(p.mrpPrice) || Number(p.originalPrice) || 0;
      let discount = p.discount || (originalPrice > price ? `${Math.round(((originalPrice - price)/originalPrice)*100)}% OFF` : '');
      
      const imgs = [p.img, p.img2, p.img3, p.image].filter(Boolean);
      return {
          id,
          name: p.name || 'Product',
          price,
          originalPrice: originalPrice || undefined,
          discount: String(discount),
          image: imgs[0] || 'https://cdn-icons-png.flaticon.com/512/1147/1147805.png',
          images: imgs.length > 0 ? imgs : undefined,
          weight: p.unit || p.weight || '1 unit',
          category: p.category || p.subCategory || 'General',
          eta: '20 MINS',
          details: p.description || p.details || ''
      };
  };

  // --- NAVIGATION LOGIC ---
  useEffect(() => {
      if (!window.history.state) window.history.replaceState({ view: 'home' }, '');
      
      const handlePop = (e: PopStateEvent) => {
          if (isProfileOpenRef.current || isContactOpenRef.current) {
              setIsProfileOpen(false); setIsContactOpen(false);
              window.history.pushState({ view: viewRef.current }, '');
              return;
          }
          if (viewRef.current === 'home') { setShowExitConfirmation(true); window.history.pushState({view:'home'},''); return; }
          
          if(e.state?.view) {
              setView(e.state.view);
              if(e.state.category) setSelectedCategoryTitle(e.state.category);
              if(e.state.product) setSelectedProduct(e.state.product);
              if(e.state.order) setSelectedOrder(e.state.order);
              
              const tabMap: any = { home:'home', cart:'cart', address:'cart', orders:'orders', tracking:'orders', categories:'categories', listing:'categories' };
              setActiveFooterTab(tabMap[e.state.view] || 'home');
          } else {
              setView('home'); setActiveFooterTab('home');
          }
      };
      window.addEventListener('popstate', handlePop);
      return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = (to: string, data: any = {}) => {
      window.history.pushState({ view: to, ...data }, '');
      setView(to as any);
      window.scrollTo(0,0);
      const tabMap: any = { home:'home', cart:'cart', orders:'orders', categories:'categories' };
      if(tabMap[to]) setActiveFooterTab(to);
  };

  // --- CART LOGIC ---
  const handleUpdateQuantity = (e: React.MouseEvent, product: Product, delta: number) => {
      e.stopPropagation();
      const now = Date.now();
      if(now - lastAddRef.current < 200) return;
      lastAddRef.current = now;

      setCartItems(prev => {
          const newQty = Math.max(0, (prev[product.id] || 0) + delta);
          if(newQty === 0) { const { [product.id]: _, ...rest } = prev; return rest; }
          return { ...prev, [product.id]: newQty };
      });

      // Visual Effect
      if(delta > 0) {
          const drop = document.createElement('img');
          drop.src = product.image;
          drop.className = 'animate-drop';
          drop.style.setProperty('--start-x', `${e.clientX}px`);
          drop.style.setProperty('--start-y', `${e.clientY}px`);
          document.body.appendChild(drop);
          setTimeout(() => drop.remove(), 600);
      }
  };

  const totalItems = Object.values(cartItems).reduce((a,b) => a+b, 0);
  const totalPrice = Object.entries(cartItems).reduce((sum, [id, qty]) => {
      const p = products.find(i => i.id === id);
      return sum + (p ? p.price * qty : 0);
  }, 0);

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-900">
      <div className="w-full max-w-[480px] bg-white min-h-screen relative shadow-2xl overflow-x-hidden flex flex-col">
        
        {showSplash && <SplashScreen />}
        {!isOnline && <OfflineNotice />}
        {!showSplash && authLoading && <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-green-600" /></div>}

        {!showSplash && !authLoading && user && (
          <>
            <ProfileMenu isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onSelect={(item) => {
                setIsProfileOpen(false);
                if(item === 'logout') { setUser(null); navigate('home'); }
                else if(item === 'contact') setIsContactOpen(true);
                else if(item === 'login') navigate('auth');
                else navigate(item);
            }}/>
            
            <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
            <ExitModal isOpen={showExitConfirmation} onClose={() => setShowExitConfirmation(false)} onConfirm={() => window.history.go(-2)} />

            {/* --- HOME VIEW --- */}
            {view === 'home' && (
              <>
                 <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
                    <header className="px-4 py-3 flex justify-between items-center">
                        <div>
                           <h1 className="text-2xl font-black text-green-600 tracking-tight flex items-center">
                             {APP_NAME} <span className="ml-2 text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">20 mins</span>
                           </h1>
                           <div onClick={() => navigate('address')} className="flex items-center mt-1 cursor-pointer">
                               <span className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[200px]">{deliveryAddress.split(',')[0] || 'Set Location'}</span>
                               <ChevronDown size={14} className="ml-1 text-green-600"/>
                           </div>
                        </div>
                        <button onClick={() => setIsProfileOpen(true)} className="p-2 bg-gray-50 rounded-full hover:bg-green-50 text-green-700 transition-colors">
                           <User size={20} />
                        </button>
                    </header>
                    <SearchBar products={products} onProductClick={(p) => { setSelectedProduct(p); navigate('details', {product: p}); }} />
                    <CategoryBar activeCategory={activeCategory} onSelectCategory={(id, target) => {
                         setActiveCategory(id);
                         if(target === 'top') window.scrollTo({top:0, behavior:'smooth'});
                         else { setSelectedCategoryTitle(target); navigate('listing', {category: target}); }
                    }}/>
                 </div>

                 <div className="pb-24">
                    <WelcomeHeader />
                    <Banners banners={banners} onBannerClick={() => { setSelectedCategoryTitle('Best Sellers'); navigate('listing', {category:'Best Sellers'}); }} />
                    <DeliveryAnimation />
                    <SectionList sections={sections} onCategoryClick={(cat) => { setSelectedCategoryTitle(cat); navigate('listing', {category: cat}); }} />
                    
                    {/* Featured Rails */}
                    <ProductRail title="Fresh Vegetables & Fruits" products={products.filter(p => p.category.match(/veg|fruit/i)).slice(0,10)} cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onProductClick={(p) => { setSelectedProduct(p); navigate('details', {product: p}); }} onCategoryClick={() => { setSelectedCategoryTitle('Vegetables & Fruit'); navigate('listing', {category: 'Vegetables & Fruit'}); }} />
                    <ProductRail title="Household Essentials" products={products.filter(p => p.category.match(/clean|hold/i)).slice(0,10)} cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onProductClick={(p) => { setSelectedProduct(p); navigate('details', {product: p}); }} onCategoryClick={() => { setSelectedCategoryTitle('Household'); navigate('listing', {category: 'Household'}); }} bgColor="bg-gray-50" />
                 </div>
              </>
            )}

            {/* --- OTHER VIEWS --- */}
            {view === 'listing' && <ProductListingPage title={selectedCategoryTitle} products={products} cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onProductClick={(p) => { setSelectedProduct(p); navigate('details', {product: p}); }} onBack={() => window.history.back()} onSearchClick={() => navigate('home')} />}
            
            {view === 'details' && selectedProduct && <ProductDetailsPage product={selectedProduct} products={products} cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onProductClick={(p) => { setSelectedProduct(p); navigate('details', {product: p}); }} onBack={() => window.history.back()} onSearchClick={() => navigate('home')} />}
            
            {(view === 'cart' || view === 'address') && <CartPage initialStep={view === 'address' ? 'address' : 'cart'} products={products} cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onBack={() => window.history.back()} onPlaceOrder={(o) => {
                 o.userId = user.uid;
                 set(ref(db, `orders/${o.id}`), o);
                 setCartItems({});
                 setOrders([o, ...orders]);
            }} onAddressSave={(addr) => setDeliveryAddress(addr)} />}

            {view === 'orders' && <OrdersPage orders={orders} products={products} onBack={() => navigate('home')} onReorder={(o) => {
                 setCartItems(prev => {
                     const next = {...prev};
                     o.items.forEach(i => next[i.productId] = (next[i.productId]||0) + i.quantity);
                     return next;
                 });
                 navigate('cart');
            }} onTrackOrder={(o) => { setSelectedOrder(o); navigate('tracking', {order: o}); }} />}

            {view === 'tracking' && selectedOrder && <TrackingPage order={selectedOrder} products={products} onBack={() => window.history.back()} onProductClick={(p) => { setSelectedProduct(p); navigate('details', {product: p}); }} />}
            
            {view === 'categories' && <CategoriesPage onBack={() => navigate('home')} onCategoryClick={(cat) => { setSelectedCategoryTitle(cat); navigate('listing', {category: cat}); }} onSearchClick={() => navigate('home')} />}
            
            {view === 'auth' && <AuthPage onBack={() => window.history.back()} />}

            {/* Floating Elements */}
            {totalItems > 0 && ['home','listing','details','categories'].includes(view) && (
                <ViewCartStickyBar itemCount={totalItems} totalPrice={totalPrice} onViewCart={() => navigate('cart')} />
            )}

            {view !== 'auth' && (
                <Footer cartCount={totalItems} activeTab={activeFooterTab} onTabSelect={(tab) => {
                    if(tab === 'home') navigate('home');
                    if(tab === 'categories') navigate('categories');
                    if(tab === 'cart') navigate('cart');
                    if(tab === 'orders') navigate('orders');
                }} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
