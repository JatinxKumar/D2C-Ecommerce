import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Package, Clock, ChevronDown, ChevronUp, MapPin, ArrowRight } from 'lucide-react';

// Lightweight Confetti Component
const Confetti = () => {
  const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: '50vw',
            y: '50vh',
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            scale: [0, 1, 0.5],
            opacity: [1, 1, 0],
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: "easeOut",
            delay: Math.random() * 0.2
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: colors[Math.floor(Math.random() * colors.length)] }}
        />
      ))}
    </div>
  );
};

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  
  // Extract data from checkout routing
  const { orderId, items = [], totalAmount = 0, address = {} } = location.state || {};

  useEffect(() => {
    // If no order ID, someone typed /order-success manually. Send them home.
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <Confetti />

      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        className="w-full max-w-md bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden relative z-10"
      >
         {/* Top Banner / Icon */}
         <div className="bg-gradient-to-b from-green-50 to-white pt-12 pb-6 px-8 flex flex-col items-center border-b border-gray-100">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 15, -10, 0] }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30"
            >
              <Check size={48} className="text-white" strokeWidth={3} />
            </motion.div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">Hey, it's confirmed!</h1>
            <p className="text-gray-500 font-medium text-center">Your order <span className="font-bold text-gray-800">#{orderId}</span> has been securely placed.</p>
         </div>

         {/* Delivery Info Block */}
         <div className="p-6 space-y-6">
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
               <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                  <Clock className="text-orange-500" size={24} />
               </div>
               <div>
                  <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-1">Expected Delivery</p>
                  <p className="text-gray-900 font-bold">15 - 30 Minutes</p>
               </div>
            </div>

            {/* Collapsible Order Summary */}
            {items.length > 0 && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button 
                  onClick={() => setShowSummary(!showSummary)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-gray-500" />
                    <span className="font-bold text-gray-800 text-sm">Order Summary ({items.length} Items)</span>
                  </div>
                  {showSummary ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                <AnimatePresence>
                  {showSummary && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white overflow-hidden"
                    >
                      <div className="p-4 space-y-3 max-h-[250px] overflow-y-auto hide-scrollbar">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                             </div>
                             <div className="flex-1 min-w-0">
                               <h4 className="text-xs font-bold text-gray-900 truncate">{item.name}</h4>
                               <p className="text-[10px] text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                             </div>
                             <p className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/50">
                         <span className="text-sm font-bold text-gray-500">Total Paid</span>
                         <span className="text-lg font-black text-gray-900">₹{totalAmount}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Address Snippet */}
            {address?.address && (
              <div className="flex gap-3 items-start p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                 <MapPin className="text-slate-400 mt-0.5 shrink-0" size={18} />
                 <div>
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Delivering To</p>
                   <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-relaxed">
                     {address.address}, {address.pincode}
                   </p>
                 </div>
              </div>
            )}
         </div>

         {/* Call to Actions */}
         <div className="p-6 pt-0 space-y-3">
            <button 
              onClick={() => navigate('/orders')}
              className="w-full bg-[#d97706] hover:bg-[#c26a05] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Track Order Status <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              Continue Shopping
            </button>
         </div>

      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
