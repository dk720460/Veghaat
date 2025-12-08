import React from 'react';
import { ArrowLeft, Package, Clock, RefreshCw, ChevronRight, CheckCircle, MapPin } from 'lucide-react';
import { Order, Product } from '../types';

interface OrdersPageProps {
  orders: Order[];
  onBack: () => void;
  onReorder: (order: Order) => void;
  onTrackOrder: (order: Order) => void;
  products?: Product[];
  onProductClick?: (product: Product) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ orders, onBack, onReorder, onTrackOrder, products, onProductClick }) => {
  
  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Delivered': return 'bg-green-50 text-green-700 border-green-100';
          case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
          case 'Returned': return 'bg-orange-50 text-orange-700 border-orange-100';
          case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-100';
          default: return 'bg-gray-50 text-gray-700 border-gray-100';
      }
  };

  const handleItemClick = (productId: string) => {
      if (products && onProductClick) {
          const product = products.find(p => p.id === productId);
          if (product) {
              onProductClick(product);
          }
      }
  };

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 mx-auto max-w-[480px] z-50 bg-[#F5F7FD] flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center space-x-3 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <button onClick={onBack} className="p-3 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center mt-20">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <Package size={48} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No past orders</h2>
            <p className="text-gray-500 max-w-xs">Start shopping to see your orders here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 p-3 flex justify-between items-center border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 p-1.5 rounded-full">
                       <Clock size={14} className="text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700">Order #{order.id}</p>
                      <p className="text-[10px] text-gray-500">{new Date(order.date).toDateString()}</p>
                    </div>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-3">
                   <div className="flex items-center space-x-2 mb-3 overflow-x-auto no-scrollbar">
                      {order.items.slice(0, 4).map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => handleItemClick(item.productId)}
                            className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded border border-gray-100 flex items-center justify-center relative cursor-pointer hover:border-green-500 transition-colors"
                        >
                           <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                           <span className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full">
                             {item.quantity}
                           </span>
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                           +{order.items.length - 4}
                        </div>
                      )}
                   </div>
                   
                   <div className="flex justify-between items-center mb-3">
                      <div>
                         <p className="text-xs text-gray-500">Total Bill</p>
                         <p className="text-sm font-bold text-gray-900">₹{order.totalAmount}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs text-gray-500">Delivering to</p>
                         <div className="flex items-center justify-end space-x-1 text-xs font-medium text-gray-800">
                            <MapPin size={10} /> <span>{order.address.split(',')[0]}</span>
                         </div>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex space-x-3 pt-2 border-t border-gray-50">
                      <button 
                        onClick={() => onTrackOrder(order)}
                        className="flex-1 py-2 text-xs font-bold text-green-700 border border-green-200 rounded-lg hover:bg-green-50 flex items-center justify-center space-x-1"
                      >
                         <span>{order.status === 'Cancelled' ? 'View Details' : 'Track Order'}</span> <ChevronRight size={12} />
                      </button>
                      <button 
                        onClick={() => onReorder(order)}
                        className="flex-1 py-2 text-xs font-bold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 flex items-center justify-center space-x-1 active:scale-95 transition-transform"
                      >
                         <RefreshCw size={12} /> <span>Reorder</span>
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;