import React from 'react';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 top-0 bottom-0 mx-auto max-w-[480px] z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-scale-up text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Exit App?</h3>
        <p className="text-sm text-gray-500 mb-6">Are you sure you want to close VegHaat?</p>
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            No, Stay
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-colors"
          >
            Yes, Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitModal;