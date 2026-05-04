import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Package,
  MapPin,
  LogOut,
  Heart,
  ShieldCheck,
  ChevronRight,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, signOut, updateUserProfile } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user]);

  useEffect(() => {
    if (user?.user_metadata) {
      setFormData({
        full_name: user.user_metadata.full_name || '',
        phone: user.user_metadata.phone || '',
        address: user.user_metadata.address || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    const { success } = await updateUserProfile(formData);
    if (success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } else {
      toast.error('Update failed');
    }
    setIsSaving(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] pb-24 font-sans selection:bg-indigo-100">

      {/* 🏔 HERO BACKGROUND SECTION */}
      <div className="h-64 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10 space-y-8">

        {/* ✨ PREMIUM PROFILE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col md:flex-row items-center gap-8"
        >
          {/* Avatar with Ring Effect */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-4xl font-black text-indigo-600 border-4 border-white shadow-xl">
              {formData.full_name?.charAt(0) || 'U'}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-3xl font-extrabold tracking-tight">{formData.full_name || "Guest User"}</h1>
              <ShieldCheck className="text-blue-500" size={24} />
            </div>
            <p className="text-slate-500 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
              Premium Member Since 2024
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button onClick={signOut} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-full font-bold text-sm hover:bg-red-100 transition-all active:scale-95">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* 📊 LUXURY STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'My Orders', value: orders.length, icon: <Package size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Wishlist', value: 12, icon: <Heart size={20} />, color: 'text-pink-600', bg: 'bg-pink-50' },
            { label: 'Total Saved', value: '₹4,500', icon: <ShieldCheck size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' }
          ].map((item, i) => (
            <motion.div
              whileHover={{ y: -5 }}
              key={i}
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5"
            >
              <div className={`${item.bg} ${item.color} p-4 rounded-2xl`}>
                {item.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{item.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 📋 DETAILS & FORM SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-extrabold text-xl">Account Settings</h3>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${isEditing ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 border border-indigo-100 shadow-sm hover:bg-indigo-50'
                }`}
            >
              {isSaving ? '...' : isEditing ? <><CheckCircle2 size={18} /> Save Changes</> : <><Edit3 size={18} /> Edit Profile</>}
            </button>
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Full Name</label>
                    <input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Phone Number</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-500 ml-1">Shipping Address</label>
                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem icon={<Phone size={18} />} label="Phone" value={formData.phone || 'Not provided'} />
                  <DetailItem icon={<MapPin size={18} />} label="Address" value={formData.address || 'No address set'} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 📦 RECENT ORDERS */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-xl">Order History</h3>
            <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="group flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-slate-400 font-medium">Delivered on 24 March, 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-indigo-600">₹{order.total}</p>
                    <ChevronRight className="inline text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" size={20} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Package size={32} />
              </div>
              <p className="text-slate-500 font-medium">No orders found yet</p>
              <button onClick={() => navigate('/')} className="mt-4 px-8 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all">
                Start Shopping
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

// Helper Component for Details
const DetailItem = ({ icon, label, value }) => (
  <div className="flex gap-4 items-start">
    <div className="text-indigo-500 mt-1">{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-slate-700 font-semibold leading-relaxed">{value}</p>
    </div>
  </div>
);

export default ProfilePage;

