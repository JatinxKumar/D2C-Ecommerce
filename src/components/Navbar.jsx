import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, User, MapPin, Bell, Award, Phone, Mic } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import UserMenu from './UserMenu';
import { products } from '../data/mockData';
import toast from 'react-hot-toast';

// Helper for fuzzy search matching
const getFuzzyMatch = (query, list) => {
  if (!query) return [];
  const q = query.toLowerCase().trim();
  
  // 1. Direct matches
  const direct = list.filter(p => p.name.toLowerCase().includes(q));
  
  // 2. Simple typo/phonetic match (if no direct)
  if (direct.length === 0) {
    return list.filter(p => {
       const name = p.name.toLowerCase();
       // Basic char-skipping/spell check (e.g. "botle" -> "bottle")
       let i = 0, j = 0;
       while (i < q.length && j < name.length) {
         if (q[i] === name[j]) i++;
         j++;
       }
       return i === q.length;
    }).slice(0, 5);
  }
  
  return direct.slice(0, 8);
};

// SearchBar Component (Extracted to fix focus bug)
const SearchBar = ({ onFocusChange }) => {
  const navigate = useNavigate();
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { searchQuery, setSearchQuery, recentSearches, addToRecent, clearRecent } = useSearch();
  const { addToCart } = useCart();
  const trendingSearches = ['groceries...', 'vegetables...', 'fruits...', 'milk & bread...', 'snacks...'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % trendingSearches.length);
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
     onFocusChange(isFocused);
  }, [isFocused]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = getFuzzyMatch(searchQuery, products);

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <b key={i} className="text-orange-600 underline decoration-orange-200">{part}</b> 
        : part
    );
  };

  const handleSearchSubmit = (term) => {
    const finalTerm = term || searchQuery;
    if (!finalTerm.trim()) return;
    addToRecent(finalTerm);
    setSearchQuery(finalTerm);
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(finalTerm)}`);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      handleSearchSubmit(transcript);
    };

    recognition.start();
  };

  return (
    <div className="relative w-full z-[60]" ref={dropdownRef}>
      <div className={`relative transition-all duration-300 ${isFocused || isListening ? 'scale-[1.02]' : ''}`}>
        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-orange-500' : 'text-gray-400'}`} size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
          placeholder={`Search for ${trendingSearches[placeholderIndex]}`} 
          className={`w-full pl-10 pr-10 py-3 bg-gray-100/80 border-2 rounded-2xl text-sm md:text-base focus:outline-none transition-all font-medium text-gray-800 placeholder:text-gray-500 ${
            isFocused ? 'bg-white border-orange-400 shadow-2xl ring-4 ring-orange-500/10' : 'border-transparent'
          }`}
        />
        <button 
          onClick={startVoiceSearch}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-orange-500 text-white animate-pulse' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}
          title="Voice Search"
        >
          <Mic size={18} />
        </button>
      </div>

      {/* Voice Listening Modal Animation */}
      <AnimatePresence>
        {isListening && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-12 rounded-[48px] flex flex-col items-center shadow-2xl"
            >
              <div className="relative mb-8">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-orange-500/20 rounded-full"
                />
                <div className="relative w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/40">
                  <Mic size={40} />
                </div>
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Listening...</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Say a product name</p>
              
              <button 
                onClick={() => setIsListening(false)}
                className="mt-10 px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black text-sm transition-colors"
              >
                CANCEL
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isFocused && (searchQuery.length > 0 || recentSearches.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden"
          >
            {/* Recent Searches */}
            {searchQuery.length === 0 && recentSearches.length > 0 && (
              <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Searches</p>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      clearRecent();
                    }}
                    className="text-[10px] font-black text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    CLEAR ALL
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearchSubmit(term);
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-all shadow-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches (Only if No Recent) */}
            {searchQuery.length === 0 && recentSearches.length === 0 && (
              <div className="p-5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                  Trending Searches
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {['Milk', 'Bread', 'Chips', 'Soft Drinks', 'Atta', 'Oil'].map((term, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearchSubmit(term);
                      }}
                      className="px-4 py-2 bg-orange-50/50 border border-orange-100 rounded-2xl text-xs font-bold text-orange-700 hover:bg-orange-100 transition-all flex items-center gap-2"
                    >
                      <Search size={12} className="opacity-50" /> {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Suggestions */}
            <div className="max-h-[70vh] overflow-y-auto hide-scrollbar">
              {searchQuery.length > 0 && results.length > 0 && (
                <div className="p-2 space-y-1">
                  {results.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-4 p-3 hover:bg-orange-50 rounded-2xl transition-all group cursor-pointer"
                      onClick={() => handleSearchSubmit(product.name)}
                    >
                      <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 group-hover:border-orange-200 shadow-sm">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-700 transition-colors truncate">
                          {highlightMatch(product.name, searchQuery)}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-black text-gray-900">₹{product.price}</span>
                          {product.mrp > product.price && (
                            <span className="text-[10px] text-gray-400 line-through font-bold">₹{product.mrp}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="px-3 py-1.5 bg-[#d97706] hover:bg-[#c26a05] text-white rounded-lg text-xs font-black shadow-lg shadow-orange-500/20 active:scale-90 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                      >
                        ADD
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results Fallback */}
              {searchQuery.length > 0 && results.length === 0 && (
                <div className="p-10 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-2xl">🔍</div>
                  <h4 className="font-black text-gray-900 mb-1 leading-tight">Oops! We couldn't find matches</h4>
                  <p className="text-xs text-gray-400 font-medium mb-6">Try searching for milk, bread, or snacks.</p>
                  
                  {/* Smart Alternates */}
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {products.slice(0, 2).map(p => (
                      <div key={p.id} className="p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-left cursor-pointer" onClick={() => addToCart(p)}>
                         <p className="text-[10px] font-bold text-orange-600 truncate">{p.name}</p>
                         <p className="text-xs font-black text-gray-900">ADD @ ₹{p.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const { itemCount, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const { orders } = useOrders();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const hasActiveOrders = user && Array.isArray(orders) && orders.some(o => o.status && o.status.trim() === 'Pending');



  return (
    <header className={`bg-white border-b border-gray-100/80 sticky top-0 z-[100] transition-all duration-300 ${isSearchFocused ? 'shadow-lg' : 'shadow-sm backdrop-blur-xl bg-white/95'}`}>
      
      <div className="max-w-7xl mx-auto px-3 sm:px-5">
        
        {/* --- MAIN HEADER ROW --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-2.5 sm:py-3 gap-3 md:gap-8">
          
          {/* MOBILE: Top Row (Menu, Logo, Action Icons) */}
          <div className="flex items-center justify-between w-full md:w-auto shrink-0">
            
            {/* Left: Mobile Menu + Logo */}
            <div className="flex items-center gap-2.5">
             
              
              <Link 
                to="/" 
                className="flex items-center gap-2 group active:scale-95 transition-transform" 
                onClick={() => {
                  setIsCartOpen(false);
                }}
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-xl flex items-center justify-center text-white font-black font-serif text-xl sm:text-2xl shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/40 transition-shadow">
                  S
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[19px] sm:text-[22px] font-black text-gray-900 leading-none tracking-tight">Shivani<span className="text-[#d97706]">Mart</span></span>
                  {/* Subtle location indicator for mobile only */}
                  <span className="text-[10px] text-gray-500 font-bold flex items-center gap-0.5 mt-0.5 md:hidden"><MapPin size={9} className="text-[#d97706]"/> Dalima Vihar</span>
                  <span className="text-[10px] text-gray-400 font-bold tracking-widest mt-0.5 uppercase hidden md:block">Premium Groceries</span>
                </div>
              </Link>
            </div>

            {/* Right: Mobile-Only Action Icons (User, Cart) */}
            <div className="flex items-center gap-2 md:hidden">
              {user ? (
                <div className="scale-90 transform origin-right"><UserMenu /></div>
              ) : (
                <Link to="/login" className="w-10 h-10 flex items-center justify-center bg-orange-50 text-[#d97706] rounded-xl font-bold hover:bg-orange-100 transition-colors shadow-sm">
                  <User size={18} strokeWidth={2.5}/>
                </Link>
              )}
              
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="relative w-10 h-10 flex items-center justify-center bg-[#d97706] text-white rounded-xl shadow-[0_4px_12px_rgba(217,119,6,0.35)] active:scale-90 transition-all font-bold"
              >
                <ShoppingCart size={18} strokeWidth={2.5} /> 
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm px-1">
                  {itemCount}
                </span>
              </button>
            </div>

          </div>

          {/* MIDDLE: Universal Search Bar (Full width mobile, responsive desktop) */}
          <div className="w-full md:flex-1 md:max-w-xl xl:max-w-2xl transform transition-transform">
            <SearchBar onFocusChange={setIsSearchFocused} />
          </div>

          {/* DESKTOP ONLY: Nav Links & Actions */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 shrink-0">
            <nav className="flex items-center gap-5 lg:gap-7 text-[15px] font-bold text-gray-600">
               <Link to="/" className="hover:text-[#d97706] transition-colors relative group">Home
                 <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d97706] group-hover:w-full transition-all duration-300"></span>
               </Link>
               <Link to="/shop" className="hover:text-[#d97706] transition-colors relative group">Shop
                 <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d97706] group-hover:w-full transition-all duration-300"></span>
               </Link>
               <Link to="/offers" className="flex items-center gap-1 hover:text-[#d97706] transition-colors relative group">
                 <span className="text-orange-500"></span> Offers
               </Link>
               <Link to="/orders" className="hover:text-[#d97706] transition-colors relative flex items-center group">
                 Orders
                 {(hasActiveOrders === true) && (
                   <span className="absolute -top-1 -right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
                 )}
               </Link>
            </nav>

            <div className="flex items-center gap-3 border-l border-gray-200 pl-6 h-8">
              {user ? (
                <UserMenu />
              ) : (
                <Link to="/login" className="flex items-center px-4 py-2 bg-orange-50 text-[#d97706] rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors shadow-sm">
                  <User size={18} className="mr-2" strokeWidth={2.5}/> Login
                </Link>
              )}
              
              <button 
                onClick={() => setIsCartOpen(true)} 
                className="flex items-center px-5 py-2.5 bg-[#d97706] hover:bg-[#c26a05] text-white rounded-xl text-sm font-bold transition-all relative shadow-[0_4px_14px_rgba(217,119,6,0.35)] hover:shadow-[0_6px_20px_rgba(217,119,6,0.4)] active:scale-95 group"
              >
                <ShoppingCart size={18} strokeWidth={2.5} className="group-hover:-rotate-12 transition-transform" /> 
                <span className="ml-2">Cart</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] min-w-[22px] h-[22px] flex items-center justify-center rounded-full font-black border-2 border-white shadow-sm px-1">
                  {itemCount}
                </span>
              </button>
            </div>
          </div>

        </div>
        
      </div>
    </header>
  );
};

export default Navbar;
