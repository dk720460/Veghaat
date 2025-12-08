import React from 'react';
import { X, Phone, Mail } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 mx-auto max-w-[480px] z-[110] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up">
        <div className="bg-green-600 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Contact Support</h2>
            <p className="text-green-100 text-sm mt-1">We are here to help you 24/7</p>
          </div>
          <button onClick={onClose} className="bg-white/20 p-1 rounded-full hover:bg-white/30 transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
            <div className="bg-green-100 p-3 rounded-full text-green-700">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Call Us</p>
              <a href={`tel:${CONTACT_INFO.phone}`} className="text-lg font-bold text-gray-800 hover:text-green-700">
                {CONTACT_INFO.phone}
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl">
            <div className="bg-green-100 p-3 rounded-full text-green-700">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Email Us</p>
              <a href={`mailto:${CONTACT_INFO.email}`} className="text-lg font-bold text-gray-800 hover:text-green-700">
                {CONTACT_INFO.email}
              </a>
            </div>
          </div>
        </div>

        <div className="p-4 text-center bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">Response time within 20 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;