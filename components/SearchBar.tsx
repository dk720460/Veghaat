
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { Product } from '../types';

interface SearchBarProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ products, onProductClick }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotating placeholder state
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Get items sorted alphabetically (Capital letter order)
  const sortedItemNames = useMemo(() => {
    return (products || [])
      .map(item => item.name)
      .sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Cycle through items for placeholder
  useEffect(() => {
    if (sortedItemNames.length === 0) return;

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % sortedItemNames.length);
    }, 2500); // Matches CSS animation duration

    return () => clearInterval(interval);
  }, [sortedItemNames]);

  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }
    
    const filtered = (products || []).filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) || 
      item.category.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));

    setSuggestions(filtered);
  }, [query, products]);

  const handleMicClick = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsFocused(true);
        inputRef.current?.focus();
      };

      recognition.start();
    } else {
      alert("Voice search not supported in this browser.");
    }
  };

  const currentPlaceholderItem = sortedItemNames.length > 0 
    ? sortedItemNames[placeholderIndex] 
    : 'Milk';

  return (
    <div className="bg-white px-4 py-3 shadow-none transition-colors">
      <div className={`relative flex items-center w-full h-12 rounded-xl border shadow-sm transition-all ${isFocused ? 'border-green-500 ring-2 ring-green-100 bg-white' : 'border-gray-200 bg-white'}`}>
        <div className="pl-3 text-green-600">
          <Search size={20} />
        </div>
        
        <div className="flex-1 relative h-full overflow-hidden ml-3">
            {/* Actual Input (Transparent background) */}
            <input
              ref={inputRef}
              type="text"
              className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-gray-700 text-base z-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            />
            
            {/* Animated Placeholder (Behind input) */}
            {!query && (
              <div className="absolute inset-0 flex items-center pointer-events-none">
                 <div key={placeholderIndex} className="animate-text-slide text-gray-400 text-base">
                    Search "{currentPlaceholderItem}"
                 </div>
              </div>
            )}
        </div>

        <div className="pr-2 flex items-center space-x-2 z-20">
           {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
           )}
          <div className="h-6 w-[1px] bg-gray-200"></div>
          <button 
            onClick={handleMicClick}
            className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-green-600 hover:bg-green-50'}`}
          >
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50 mx-4">
          {suggestions.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                  setQuery(item.name);
                  onProductClick(item);
              }}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 border-gray-50"
            >
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-md object-cover mr-3" />
              <div>
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-500">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;