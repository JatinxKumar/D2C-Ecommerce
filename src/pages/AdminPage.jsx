import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, ShoppingBag, Settings, LogOut, TrendingUp, DollarSign, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, count: 0 });
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [adminCancelReason, setAdminCancelReason] = useState('');

  // Security Verification Effect
  useEffect(() => {
    if (!loading && (!user || user.email !== 'admin@gmail.com')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchOrders();

    // Setup Realtime Subscription to watch for new orders hitting the database
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // Fire a loud notification for the Admin
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-blue-500`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500">
                      <span className="text-xl">🚨</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">
                      New Live Order!
                    </p>
                    <p className="mt-1 text-sm text-slate-500 font-bold">
                      {payload.new.customer_name} just ordered (₹{payload.new.total}).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ), { duration: 6000 });
        }
        
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching live orders:', error);
    } else if (data) {
      setOrders(data);
      // Calc basic stats
      const totalRev = data.reduce((sum, ord) => sum + Number(ord.total), 0);
      setStats({ revenue: totalRev, count: data.length });
    }
  };

  const handleStatusUpdate = async (id, newStatus, reason = '') => {
    // 1. Immediately update DB
    const updateData = { status: newStatus };
    if (newStatus === 'Cancelled' && reason) {
      updateData.cancel_reason = `Admin: ${reason}`;
    }

    const { error } = await supabase.from('orders').update(updateData).eq('id', id);
    if (error) {
      toast.error('Failed to update status');
      return;
    }

    if (newStatus === 'Packed') {
      toast.success(`Order ${id} is Packed! 📦 Auto-Delivery timer started (2 mins).`);
      
      // 2. The 2-Minute Auto-Delivery Logic
      setTimeout(async () => {
        // Verify it wasn't canceled in the meantime
        const { data: check } = await supabase.from('orders').select('status').eq('id', id).single();
        if (check && check.status === 'Packed') {
           await supabase.from('orders').update({ status: 'Delivered' }).eq('id', id);
           toast.success(`✅ Auto-Delivered: Order ${id} reached the customer!`);
           fetchOrders(); // Refresh UI
        }
      }, 120000); // 120,000 ms = 2 minutes

    } else if (newStatus === 'Cancelled') {
      toast.error(`Order ${id} Cancelled 🚫`);
    }

    fetchOrders(); // Refresh UI
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
         <p className="text-blue-500 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Mission Control...</p>
      </div>
    );
  }

  // Prevent flash content before redirect finishes
  if (!user || user.email !== 'admin@gmail.com') return null;

  const statCards = [
    { title: 'Live Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: <DollarSign className="text-emerald-500" />, trend: 'Active' },
    { title: 'Total Orders', value: stats.count, icon: <ShoppingBag className="text-blue-500" />, trend: 'Live Sync' },
    { title: 'Total Customers', value: 'Live', icon: <Users className="text-indigo-500" />, trend: 'Connected' },
    { title: 'Active Inventory', value: 'Online', icon: <Package className="text-amber-500" />, trend: 'Syncing' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-white font-black text-xl tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">SK</span>
            </div>
            Admin Portal
          </h1>
        </div>
        
        <div className="flex-1 py-6">
          <nav className="space-y-1 px-3">
            {[
              { label: 'Live Orders', icon: <LayoutDashboard size={18} />, active: true },
              { label: 'Products', icon: <Package size={18} /> },
              { label: 'Settings', icon: <Settings size={18} /> }
            ].map((item, idx) => (
              <button 
                key={idx}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  item.active 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
           <button 
             onClick={handleSignOut}
             className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-colors"
           >
             <LogOut size={18} />
             Sign Out Securely
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm relative z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mission Control</h2>
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
             </span>
             <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest hidden sm:block">Live Sync Active</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Store Admin</p>
               <p className="text-sm font-bold text-slate-700">{user.email}</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-md border-2 border-slate-100">
               A
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {statCards.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-sm border border-slate-100">
                    {stat.icon}
                  </div>
                  <div className="px-2.5 py-1 rounded-full text-xs font-black tracking-wider bg-slate-100 text-slate-500">
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{stat.title}</h3>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Live Orders Interface */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                Incoming Transactions 
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              {orders.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
                      <ShoppingBag className="text-slate-300" size={32} />
                   </div>
                   <h4 className="text-lg font-black text-slate-800 mb-1">No Orders Yet</h4>
                   <p className="text-sm font-medium text-slate-400">Waiting for customers to checkout in real-time...</p>
                </div>
              ) : (
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-[#f8fafc] text-slate-400 text-[10px] uppercase font-black tracking-widest border-y border-slate-100">
                    <tr>
                      <th className="px-6 py-4">ID & Date</th>
                      <th className="px-6 py-4">Customer & Contact</th>
                      <th className="px-6 py-4">Delivery Address</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {orders.map((order, idx) => (
                      <motion.tr 
                        key={order.id} 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <p className="font-black text-slate-900 tracking-wider">#{order.id}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-800">{order.customer_name}</p>
                          <p className="text-xs font-bold text-blue-600 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {order.phone}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-medium text-slate-600 line-clamp-2 max-w-[200px] leading-snug">
                            {order.address}, {order.city} - {order.pincode}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto custom-scrollbar pr-2">
                             {order.items?.map((item, i) => (
                               <div key={i} className="flex items-center gap-2 text-xs">
                                  <span className="font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{item.quantity}x</span>
                                  <span className="font-bold text-slate-700 truncate max-w-[120px]" title={item.name}>{item.name}</span>
                               </div>
                             ))}
                          </div>
                          <p className="text-sm font-black text-emerald-600 mt-2">₹{order.total}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20' :
                            order.status === 'Packed' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20' :
                            order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-500/20' :
                            'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20' // Pending
                          }`}>
                            {order.status === 'Delivered' && <CheckCircle size={14} />}
                            {order.status === 'Packed' && <Clock size={14} className="animate-spin-slow" />}
                            {order.status === 'Cancelled' && <XCircle size={14} />}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right space-y-2">
                          <AnimatePresence>
                            {order.status === 'Pending' && (
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex flex-col gap-2 items-end"
                              >
                                {cancellingOrderId === order.id ? (
                                  <div className="flex flex-col gap-2 w-[150px] bg-rose-50 p-2 rounded-xl border border-rose-100">
                                    <input 
                                      type="text"
                                      placeholder="Reason..."
                                      value={adminCancelReason}
                                      onChange={e => setAdminCancelReason(e.target.value)}
                                      className="text-[10px] px-2 py-1.5 rounded-lg border border-rose-200 focus:outline-none bg-white"
                                      autoFocus
                                    />
                                    <div className="flex gap-1">
                                      <button 
                                        onClick={() => {
                                          if (!adminCancelReason.trim()) return;
                                          handleStatusUpdate(order.id, 'Cancelled', adminCancelReason);
                                          setCancellingOrderId(null);
                                          setAdminCancelReason('');
                                        }}
                                        className="flex-1 bg-rose-600 text-white text-[9px] font-black py-1 rounded"
                                      >
                                        CONFIRM
                                      </button>
                                      <button 
                                        onClick={() => setCancellingOrderId(null)}
                                        className="flex-1 bg-white border border-rose-200 text-rose-600 text-[9px] font-black py-1 rounded"
                                      >
                                        X
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => handleStatusUpdate(order.id, 'Packed')}
                                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors shadow-sm active:scale-95 w-[110px] justify-center"
                                    >
                                      <Package size={14} /> Packed
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setCancellingOrderId(order.id);
                                        setAdminCancelReason('');
                                      }}
                                      className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-colors active:scale-95 w-[110px] justify-center"
                                    >
                                      <XCircle size={14} /> Cancel
                                    </button>
                                  </>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          {order.status === 'Packed' && (
                             <p className="text-[10px] font-bold text-slate-400 italic">Auto-delivering...</p>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
          
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
