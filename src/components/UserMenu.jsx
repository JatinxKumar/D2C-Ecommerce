import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, Package, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const userInitial = getInitials(user.user_metadata?.full_name || user.email);
  const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-all border border-slate-200/60 active:scale-95 group shadow-sm"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center border-2 border-white shadow-sm group-hover:border-blue-100 transition-all">
          {userAvatar ? (
            <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#005cbb] to-[#004791] flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-tighter">{userInitial}</span>
            </div>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none mb-1">Signed in as</p>
          <p className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{user.user_metadata?.full_name || 'User'}</p>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl overflow-hidden z-[100] border border-slate-100"
          >
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
              <p className="text-sm font-black text-slate-800 truncate">{user.email}</p>
            </div>

            <div className="p-2">
              <Link
                to="/orders"
                className="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
                onClick={() => setIsOpen(false)}
              >
                <Package size={18} className="group-hover:scale-110 transition-transform" />
                <span>My Orders</span>
              </Link>

              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all group"
              >
                <Settings size={18} className="group-hover:scale-110 transition-transform" />
                <span>Settings</span>
              </button>

              <hr className="my-2 border-slate-100" />

              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all group"
              >
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
