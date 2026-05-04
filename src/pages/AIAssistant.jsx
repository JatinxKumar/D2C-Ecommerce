import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, ShoppingCart, ArrowLeft, Mic, MicOff, Sparkles, Package, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { getAIResponse } from '../services/groq';
import InChatProductCard from '../components/InChatProductCard';
import toast from 'react-hot-toast';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Shopping Assistant for Shivani Karyana Store. How can I help you today? You can ask me to add products, check deals, or track your orders!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const { cart, addByName, clearCart, removeFromCart, updateQuantity, setIsCartOpen, cartTotal, itemCount } = useCart();
  const { orders } = useOrders();
  const { user } = useAuth();

  // Typewriter effect for initial message
  useEffect(() => {
    if (user?.user_metadata?.full_name && messages.length === 1) {
      const firstName = user.user_metadata.full_name.split(' ')[0];
      const greeting = `Hello ${firstName}! I am your AI Shopping Assistant. I can help you find groceries, track orders, or manage your cart. What's on your list today? 🏪`;
      
      setMessages([{
        role: 'assistant',
        content: greeting,
      }]);
    }
  }, [user]);

  const quickReplies = [
    { label: 'Track Order', icon: <Package size={14} className="text-indigo-500" /> },
    { label: 'Daily Deals', icon: <TrendingUp size={14} className="text-orange-500" /> },
    { label: 'Milk & Bread', icon: <Sparkles size={14} className="text-yellow-500" /> },
    { label: 'Party Snacks', icon: <Sparkles size={14} className="text-pink-500" /> }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Voice Search Logic
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const handleSend = async (e, forcedInput = null) => {
    if (e) e.preventDefault();
    const finalInput = forcedInput || input;
    if (!finalInput.trim() || isLoading) return;

      const userMessage = { role: 'user', content: finalInput };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      const cartContext = `
        CART CONTEXT:
        - Current Total: ₹${cartTotal}
        - Items count: ${itemCount}
        - Current items: ${cart.map(i => `${i.name} (x${i.quantity})`).join(', ')}
      `.trim();

      try {
        const allMessages = [...messages, userMessage];
        const cleanMessages = allMessages
          .filter(m => !m.isError)
          .map(m => ({ role: m.role, content: m.content }));
        
        // Inject Cart Context and Basic Price List for Math
        cleanMessages.push({ role: 'system', content: cartContext });
        
        if (finalInput.toLowerCase().includes('order') || finalInput.toLowerCase().includes('track')) {
        const orderContext = orders.length > 0 
          ? `User's latest order: ID #${orders[0].id}, Status: ${orders[0].status}, Items: ${orders[0].items.length}`
          : "User has no orders yet.";
        cleanMessages.push({ role: 'system', content: orderContext });
      }

      const response = await getAIResponse(cleanMessages);
      
      let foundProducts = [];
      let recipeIngredients = null;

      // 🛒 Handle Direct Cart Actions
      const cartMatch = response.match(/ADD_TO_CART_START([\s\S]*?)ADD_TO_CART_END/);
      if (cartMatch) {
        try {
          const cartData = JSON.parse(cartMatch[1]);
          if (cartData.actions) {
            cartData.actions.forEach((action) => {
              if (action.type === 'clear') {
                clearCart();
              } else if (action.type === 'remove') {
                const item = cart.find(i => i.name.toLowerCase().includes(action.name.toLowerCase()));
                if (item) {
                  removeFromCart(item.id, item.name);
                }
              } else if (action.type === 'update') {
                const item = cart.find(i => i.name.toLowerCase().includes(action.name.toLowerCase()));
                if (item) {
                  updateQuantity(item.id, action.quantity || 1);
                }
              } else if (action.type === 'checkout') {
                setIsCartOpen(true);
              } else {
                const res = addByName(action.name, action.quantity || 1);
                // We don't push to foundProducts here because the user sees the confirmation text
                // and we don't want redundant large cards.
              }
            });
          }
        } catch (e) {
          console.error("Failed to parse cart JSON", e);
        }
      }

      // 👨‍🍳 Handle Recipe Ingredients
      const recipeMatch = response.match(/RECIPE_INGREDIENTS_START([\s\S]*?)RECIPE_INGREDIENTS_END/);
      if (recipeMatch) {
        try {
          recipeIngredients = JSON.parse(recipeMatch[1]);
        } catch (e) {
          console.error("Failed to parse recipe JSON", e);
        }
      }

      let displayContent = response
        .replace(/ADD_TO_CART_START[\s\S]*?ADD_TO_CART_END/g, '')
        .replace(/RECIPE_INGREDIENTS_START[\s\S]*?RECIPE_INGREDIENTS_END/g, '')
        .replace(/```json[\s\S]*?```/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\{[\s\S]*?\}/g, '')
        .replace(/(json|code|data|actions|block|technical|here is the):/gi, '')
        .trim();
      
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: displayContent || 'Done! Your cart is updated.',
          products: foundProducts,
          recipeIngredients: recipeIngredients
        },
      ]);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: `Sorry, I'm having trouble right now (${error.message}). Please try again in a moment! 🏪`,
          isError: true 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllIngredients = (ingredients) => {
    if (!Array.isArray(ingredients)) return;
    
    let addedCount = 0;
    ingredients.forEach(name => {
      const res = addByName(name, 1);
      if (res.success) addedCount++;
    });

    if (addedCount > 0) {
      toast.success(`${addedCount} ingredients added to your cart! 🛍️`, {
        icon: '🔥',
        style: {
          borderRadius: '16px',
          background: '#4f46e5',
          color: '#fff',
          fontWeight: 'bold'
        }
      });
      setIsCartOpen(true);
    } else {
      toast.error("Couldn't find those items in stock.");
    }
  };

  return (
    <div className="h-screen bg-[#fcfdff] flex flex-col font-inter overflow-hidden relative">
      {/* Sleek Mesh Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[0%] right-[0%] w-[40%] h-[40%] bg-blue-50/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] bg-indigo-50/40 rounded-full blur-[100px]" />
      </div>

      {/* Professional Slim Header */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-[100] border-b border-gray-100 flex items-center justify-between px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <Link 
            to="/" 
            className="w-9 h-9 flex items-center justify-center bg-gray-50/80 hover:bg-white text-slate-500 rounded-xl transition-all border border-gray-100 active:scale-90"
          >
            <ArrowLeft size={16} />
          </Link>
        </div>

        <div className="flex flex-col items-center flex-grow text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">Aapka Assistant</h1>
          </div>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">&nbsp;Commerce Assistant</p>
        </div>

        <div className="flex items-center justify-end flex-1">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="group relative flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl shadow-md hover:shadow-indigo-100 transition-all active:scale-95 overflow-hidden"
          >
            <ShoppingCart size={14} />
            <span className="font-extrabold text-[10px] uppercase tracking-wider">Cart</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Conversational Content */}
      <div className="flex-grow overflow-y-auto px-4 py-6 space-y-6 scroll-smooth relative z-10 custom-scrollbar">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className={`flex mb-6 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm border
                    ${m.role === 'user' 
                      ? 'bg-slate-50 border-slate-200 text-slate-500' 
                      : 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-400 text-white'}`}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  <div className={`space-y-2.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Bubble */}
                    <div className={`relative px-4 py-3 rounded-2xl text-[14px] leading-relaxed font-medium transition-all shadow-sm border
                      ${m.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-transparent rounded-tr-none' 
                        : m.isError
                          ? 'bg-red-50 text-red-600 border-red-100 rounded-tl-none'
                          : 'bg-white text-slate-700 border-gray-100 rounded-tl-none'}`}>
                      {m.content}
                    </div>

                    {/* 👨‍🍳 Recipe Ingredients Action */}
                    {m.recipeIngredients && m.recipeIngredients.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex flex-wrap gap-1.5">
                          {m.recipeIngredients.map((ing, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md">
                              + {ing}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleAddAllIngredients(m.recipeIngredients)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all w-fit"
                        >
                          <ShoppingCart size={14} />
                          ADD ALL TO CART
                        </button>
                      </motion.div>
                    )}

                    {/* Products Grid */}
                    {m.products && m.products.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 gap-2.5 w-full min-w-[240px]"
                      >
                        {m.products.map(p => (
                          <InChatProductCard key={p.id} product={p} />
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start ml-11"
            >
              <div className="flex gap-2 items-center bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white shadow-sm">
                <Loader2 size={12} className="animate-spin text-indigo-500" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1 text-center">Thinking</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-6" />
        </div>
      </div>

      {/* Sleek Integrated Footer */}
      <div className="bg-white/60 backdrop-blur-2xl border-t border-gray-100/50 px-4 py-6 relative z-20">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Enhanced Smart Chips - Horizontal Scroll */}
          {!isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-1">
              <AnimatePresence>
                {quickReplies.map((chip, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(null, chip.label)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 border border-gray-100 text-[10px] font-black uppercase tracking-wider text-slate-600 rounded-full shadow-sm hover:border-indigo-400 hover:text-indigo-600 transition-all active:scale-95 whitespace-nowrap"
                  >
                    {chip.icon}
                    {chip.label}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Luxury Unified Input Bar */}
          <div className="relative flex items-center gap-3">
            <form onSubmit={handleSend} className="flex-grow flex items-center relative group">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="w-full relative flex items-center bg-gray-50/80 backdrop-blur-md rounded-2xl focus-within:bg-white transition-all shadow-inner overflow-hidden">
                <button
                  type="button"
                  onClick={startListening}
                  className={`p-3.5 transition-all active:scale-90 ${isListening ? 'text-red-500 scale-110' : 'text-slate-400 hover:text-indigo-500'}`}
                >
                  {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
                </button>
                
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for anything..."
                  className="w-full py-4 px-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="m-1.5 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale transition-all active:scale-90"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
