

import { MainSection, Banner, Product } from './types';

export const APP_NAME = "VegHaat";
export const TAGLINE = "Delivery in 20 minutes";

export const CONTACT_INFO = {
  phone: "+917204604883",
  email: "haatveg@gmail.com"
};

export const BANNERS: Banner[] = [
  { id: 1, image: "https://picsum.photos/800/400?random=1", linkTo: "best-seller" },
  { id: 2, image: "https://picsum.photos/800/400?random=2", linkTo: "grocery" },
  { id: 3, image: "https://picsum.photos/800/400?random=3", linkTo: "snacks" },
];

export const MAIN_SECTIONS: MainSection[] = [
  {
    title: "Best Sellers",
    subCategories: [
      { name: "Vegetables & Fruit", image: "https://i.ibb.co/tMXjVbZC/blob.png" },
      { name: "Atta Rice & Dal", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80" },
      { name: "Dairy Bread & Egg", image: "https://i.ibb.co/JjKGtjcf/blob.jpg" },
      { name: "Oil Ghee & Masala", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80" },
      { name: "Dry Fruit & Breakfast", image: "https://i.ibb.co/gM5mNPx4/blob.jpg" },
      { name: "Chicken & Fish", image: "https://images.unsplash.com/photo-1587593810167-a6492f5605f1?auto=format&fit=crop&w=300&q=80" },
    ]
  },
  {
    title: "Grocery",
    subCategories: [
      { name: "Vegetables & Fruit", image: "https://i.ibb.co/tMXjVbZC/blob.png" },
      { name: "Atta Rice & Dal", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80" },
      { name: "Oil Ghee & Masala", image: "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&w=300&q=80" },
      { name: "Dairy Bread & Egg", image: "https://i.ibb.co/JjKGtjcf/blob.jpg" },
      { name: "Chicken & Fish", image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&w=300&q=80" },
      { name: "Bakery & Biscuits", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80" },
    ]
  },
  {
    title: "Snacks & Drinks",
    subCategories: [
      { name: "Chips & Namkeen", image: "https://images.unsplash.com/photo-1621447504864-d8686e12698c?auto=format&fit=crop&w=300&q=80" },
      { name: "Sweets & Chocolate", image: "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=300&q=80" },
      { name: "Drinks & Juices", image: "https://i.ibb.co/C5PX8MkN/blob.jpg" },
      { name: "Instant Food", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=300&q=80" },
      { name: "Ice Cream", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=300&q=80" },
      { name: "Tea Coffee & Milk", image: "https://i.ibb.co/6R7dyGQt/blob.jpg" },
    ]
  },
  {
    title: "Personal Care & Beauty",
    subCategories: [
      { name: "Bath & Body", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&w=300&q=80" },
      { name: "Skin & Face", image: "https://images.unsplash.com/photo-1556228720-1957be6a964a?auto=format&fit=crop&w=300&q=80" },
      { name: "Baby Care", image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=300&q=80" },
      { name: "Cleaner & Repellents", image: "https://i.ibb.co/MyBhZ0QF/blob.jpg" },
      { name: "Household & Cleaning", image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=300&q=80" },
      { name: "Feminine & Hygiene", image: "https://images.unsplash.com/photo-1554057009-6798e8751525?auto=format&fit=crop&w=300&q=80" },
    ]
  }
];

export const SIDEBAR_CATEGORIES = [
  { id: 'all', name: 'All', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=100&q=60' },
  { id: 'veg', name: 'Fresh Vegetables', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=100&q=60' },
  { id: 'fruit', name: 'Fresh Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=100&q=60' },
  { id: 'exotic', name: 'Exotics', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=100&q=60' },
  { id: 'coriander', name: 'Coriander & Others', image: 'https://images.unsplash.com/photo-1589136127885-d89e7ae86d5e?auto=format&fit=crop&w=100&q=60' },
  { id: 'flowers', name: 'Flowers & Leaves', image: 'https://images.unsplash.com/photo-1490750967868-58cb75069ed6?auto=format&fit=crop&w=100&q=60' },
  { id: 'organic', name: 'Trusted Organics', image: 'https://images.unsplash.com/photo-1615485500704-8e99099928b3?auto=format&fit=crop&w=100&q=60' },
  { id: 'seasonal', name: 'Seasonal', image: 'https://images.unsplash.com/photo-1560155016-bd4879ae8f21?auto=format&fit=crop&w=100&q=60' },
  { id: 'cut', name: 'Freshly Cut & Sprouts', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=60' },
];

export const SEARCH_ITEMS: Product[] = [
  { 
    id: '1', 
    name: 'Green Chilli 100 g (Menasinakayi)', 
    weight: '100 g', 
    category: 'Fresh Vegetables', 
    price: 13, 
    originalPrice: 16, 
    discount: '18% OFF', 
    eta: '8 MINS', 
    image: 'https://images.unsplash.com/photo-1588833946439-df4d22cbca1e?auto=format&fit=crop&w=500&q=80',
    details: 'Fresh green chillies are a staple in Indian cooking. They add a spicy kick to curries, chutneys, and salads.'
  },
  { 
    id: '2', 
    name: 'Onion (Eerulli)', 
    weight: '0.95 - 1.05 kg', 
    category: 'Fresh Vegetables', 
    price: 28, 
    originalPrice: 38, 
    discount: '26% OFF', 
    eta: '8 MINS', 
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=80',
    details: 'Onions are essential for almost every Indian dish. These are fresh, high-quality onions sourced directly from farmers.'
  },
  { 
    id: '3', 
    name: 'Potato (Alugadde)', 
    weight: '0.95 - 1.05 kg', 
    category: 'Fresh Vegetables', 
    price: 35, 
    originalPrice: 48, 
    discount: '27% OFF', 
    eta: '8 MINS', 
    image: 'https://images.unsplash.com/photo-1518977676605-dc9f2b545d8d?auto=format&fit=crop&w=500&q=80',
    details: 'Versatile and starchy, these potatoes are perfect for curries, fries, or mash.'
  },
  { 
    id: '4', 
    name: 'Desi Tomato 500 g (Naati Tomaato)', 
    weight: '500 g', 
    category: 'Fresh Vegetables', 
    price: 28, 
    originalPrice: 37, 
    discount: '24% OFF', 
    eta: '8 MINS', 
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
    details: 'Sour and juicy country tomatoes, ideal for rasam and sambar.'
  },
  { 
    id: '5', 
    name: 'Cucumber (Southekayi)', 
    weight: '500 g', 
    category: 'Fresh Vegetables', 
    price: 22, 
    originalPrice: 30, 
    discount: '20% OFF', 
    eta: '9 MINS', 
    image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=500&q=80',
    details: 'Cool and crunchy cucumbers, great for salads and raita.'
  },
  { 
    id: '6', 
    name: 'Lemon (Nimbehannu)', 
    weight: '3 - 4 pcs', 
    category: 'Fresh Vegetables', 
    price: 25, 
    originalPrice: 35, 
    discount: '30% OFF', 
    eta: '10 MINS', 
    image: 'https://images.unsplash.com/photo-1595855709990-c56a2c3015ba?auto=format&fit=crop&w=500&q=80',
    details: 'Zesty fresh lemons to add flavor to your food and drinks.'
  },
  { 
    id: '7', 
    name: 'Capsicum Green (Doddamesinakai)', 
    weight: '500 g', 
    category: 'Fresh Vegetables', 
    price: 45, 
    originalPrice: 60, 
    discount: '25% OFF', 
    eta: '12 MINS', 
    image: 'https://images.unsplash.com/photo-1563565375-f3fdf5dbc240?auto=format&fit=crop&w=500&q=80',
    details: 'Crunchy green capsicum, perfect for stir-fries and pizza toppings.'
  },
  { 
    id: '8', 
    name: 'Carrot Local (Gajjari)', 
    weight: '500 g', 
    category: 'Fresh Vegetables', 
    price: 30, 
    originalPrice: 40, 
    discount: '25% OFF', 
    eta: '15 MINS', 
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=500&q=80',
    details: 'Sweet and orange carrots, rich in Vitamin A. Good for salads and cooking.'
  },
];