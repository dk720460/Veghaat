import React from 'react';
import { User, Package, MapPin, Phone, FileText, Info, LogOut, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { CONTACT_INFO } from '../constants';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: string) => void;
  user: any; // Firebase user object
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onClose, onSelect, user }) => {
  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onSelect('logout');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const menuItems = [
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'contact', label: 'Contact Us', icon: Phone },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'about', label: 'About Us', icon: Info },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex justify-end">
      <div className="w-80 h-full bg-white shadow-xl animate-slide-in-right overflow-y-auto flex flex-col">
        <div className="p-6 bg-green-50 border-b border-green-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 line-clamp-1">
              {user?.displayName || 'VegHaat User'}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-green-100 rounded-full">
            <X size={24} className="text-green-700" />
          </button>
        </div>

        <div className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="w-full flex items-center space-x-4 p-4 rounded-xl transition-all hover:bg-gray-50 text-gray-700"
            >
              <item.icon size={20} />
              <span className="font-medium text-lg">{item.label}</span>
            </button>
          ))}

          <div className="border-t border-gray-100 my-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 p-4 rounded-xl transition-all hover:bg-red-50 text-red-600"
            >
              <LogOut size={20} />
              <span className="font-medium text-lg">Logout</span>
            </button>
          </div>
        </div>

        <div className="p-6 mt-auto border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">App Version 1.1.0</h3>
            <p className="text-xs text-gray-400">Made for VegHaat</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;