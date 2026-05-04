import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const AIFloatingButton = () => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[200]"
    >
      <Link to="/ai-assistant">
        <div className="relative group">
          {/* Glowing Aura */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#005cbb] to-[#00a8e8] rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
          
          <button className="relative flex items-center justify-center w-16 h-16 bg-[#005cbb] text-white rounded-full shadow-2xl overflow-hidden">
            <Bot size={32} />
            
            {/* Inner Shine */}
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          </button>

          {/* Label Tooltip */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-black/80 backdrop-blur-md text-white text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI Assistant
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AIFloatingButton;
