import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  
  const cartItem = cart.find(item => item.id === product.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 overflow-hidden flex flex-col group h-full relative"
    >
      <div className="relative aspect-square bg-[#fcfcfc] p-6 overflow-hidden">
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full z-10 shadow-lg shadow-red-500/20 uppercase tracking-wider">
            {product.discount}% OFF
          </div>
        )}
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out select-none pointer-events-none"
          loading="lazy"
          draggable="false"
        />
        
        {/* Savings Badge */}
        {product.mrp > product.price && (
          <div className="absolute bottom-2 right-3 bg-white/90 backdrop-blur-sm border border-orange-100 px-2 py-0.5 rounded-lg shadow-sm">
             <p className="text-[9px] font-black text-orange-600">SAVE ₹{product.mrp - product.price}</p>
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col bg-white">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded-md uppercase tracking-widest">{product.unit}</span>
          {product.isBestSeller && (
            <span className="text-[9px] font-black text-blue-600 flex items-center gap-0.5 uppercase tracking-widest">
              <span className="text-xs">⭐</span> Bestseller
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 leading-tight mb-3 line-clamp-2 flex-1 group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="font-black text-xl text-gray-900 tracking-tighter">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through font-bold">₹{product.mrp}</span>
            )}
          </div>
          
          <div className="relative h-10 min-w-[80px]">
            <AnimatePresence mode="wait">
              {cartItem ? (
                <motion.div 
                  key="quantity"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center bg-orange-600 rounded-xl p-1 shadow-lg shadow-orange-500/20"
                >
                  <button 
                    onClick={() => cartItem.quantity === 1 ? removeFromCart(product.id, product.name) : updateQuantity(product.id, cartItem.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus size={14} strokeWidth={4} />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-white">
                    {cartItem.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    aria-label="Increase"
                  >
                    <Plus size={14} strokeWidth={4} />
                  </button>
                </motion.div>
              ) : (
                <motion.button 
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => addToCart(product)}
                  className="absolute inset-0 px-6 bg-white text-[#d97706] font-black rounded-xl border-2 border-orange-100 hover:border-orange-500 hover:bg-orange-50 transition-all active:scale-95 shadow-sm uppercase text-xs tracking-widest flex items-center justify-center"
                >
                  ADD
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
