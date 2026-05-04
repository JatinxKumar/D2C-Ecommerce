import { motion } from 'framer-motion';
import { Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const InChatProductCard = ({ product }) => {
  const { addToCart } = useCart();

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-4 p-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm mt-3 group"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/60 p-1 flex-shrink-0">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
        />
      </div>
      <div className="flex-grow flex flex-col justify-center min-w-0">
        <h4 className="text-xs font-bold text-slate-800 truncate mb-0.5">{product.name}</h4>
        <p className="text-[10px] text-slate-500 font-medium mb-2">{product.unit || 'Each'}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-[#005cbb]">₹{product.price}</span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#005cbb] hover:bg-[#004a96] text-white text-[10px] font-bold rounded-lg transition-colors shadow-md shadow-blue-200"
          >
            <Plus size={12} />
            <span>ADD</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default InChatProductCard;
