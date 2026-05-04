import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Percent, Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: ShoppingBag },
    { label: 'Offers', path: '/offers', icon: Percent },
    { label: 'Orders', path: '/orders', icon: Package },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-gray-100 px-2 py-2 z-[150] md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-between items-center px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 py-1 px-3 min-w-[64px] transition-all"
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-orange-50 text-orange-600 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}>
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-0.5 border-2 border-orange-200 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
              
              <span className={`text-[10px] font-black uppercase tracking-wider ${active ? 'text-orange-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe Area Spacer for iOS / Modern Phablets */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNav;
