import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, user, loading: authLoading, forceAdminLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    pincode: ''
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (user.email === 'admin@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Manual Override for Instant Admin Access
    if (formData.email === 'admin@gmail.com' && formData.password === 'admin@123') {
      forceAdminLogin();
      navigate('/admin');
      setLoading(false);
      return;
    }

    if (isLogin) {
      const res = await signInWithEmail(formData.email, formData.password);
      if (res.success) {
        if (formData.email === 'admin@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }
    } else {
      const res = await signUpWithEmail(
        formData.email, 
        formData.password, 
        formData.name, 
        formData.phone, 
        formData.address, 
        formData.pincode
      );
      if (res.success) {
        setIsLogin(true);
        toast.success("Welcome aboard! Please sign in.");
      }
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FCFDFF] overflow-hidden">
      
      {/* Left: Minimalist Immersive Hero */}
      <div className="hidden lg:flex relative h-full w-full flex-col p-16 justify-between overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=800" 
            alt="Organic Texture" 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-110 blur-[1px]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>
        
        <Link to="/" className="relative z-10 text-white font-black text-2xl tracking-tighter flex items-center gap-2 group">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <span className="text-white text-xs">S</span>
          </div>
          Shivani Store
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg"
        >
          <p className="text-green-500 font-bold text-sm uppercase tracking-[0.3em] mb-4">RAJPURA'S DIGITAL PANTRY</p>
          <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tight mb-8">
            Quality Grocery, <br/>
            <span className="italic font-serif text-white/60">Local Heart.</span>
          </h2>
          <div className="flex items-center gap-6">
            <div className="h-px w-12 bg-white/30"></div>
            <p className="text-white/50 font-medium text-lg italic uppercase tracking-wider">Since 1998</p>
          </div>
        </motion.div>

        <div className="relative z-10 flex gap-12 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
           <span>FRESHNESS GUARANTEED</span>
           <span>SECURE CHECKOUT</span>
           <span>REAL-TIME TRACKING</span>
        </div>
      </div>

      {/* Right: Masterpiece Login Card */}
      <div className="relative flex items-center justify-center p-6 md:p-12 overflow-hidden">
        {/* Subtle Background Art */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-green-100/40 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] bg-white/40 backdrop-blur-[40px] rounded-[48px] shadow-[0_32px_128px_-32px_rgba(0,0,0,0.1)] border border-white/50 p-10 md:p-12 relative z-10"
        >
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-slate-200">
               <Lock className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
              {isLogin ? 'Welcome Back.' : 'Get Started.'}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
              {isLogin ? 'Personalized shopping awaits' : 'Join the neighborhood store'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-1"
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-5 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 placeholder-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-green-500/5 focus:border-green-400 transition-all shadow-sm"
                      placeholder="Your Full Name"
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                      <div className="relative group">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-10 pr-3 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 placeholder-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-green-500/5 focus:border-green-400 transition-all shadow-sm"
                          placeholder="9876543210"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                      <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                        <input
                          type="text"
                          required
                          pattern="[0-9]{6}"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-full pl-10 pr-3 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black text-slate-800 placeholder-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-green-500/5 focus:border-green-400 transition-all shadow-sm"
                          placeholder="140401"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 pb-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                      <textarea
                        required
                        rows="2"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 placeholder-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-green-500/5 focus:border-green-400 transition-all shadow-sm resize-none"
                        placeholder="House No, Street, Landmark..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-5 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 placeholder-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-green-500/5 focus:border-green-400 transition-all shadow-sm"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Code</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-green-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-5 bg-slate-50/50 border border-slate-100 rounded-3xl text-sm font-black text-slate-800 placeholder-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-green-500/5 focus:border-green-400 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 hover:bg-black text-white rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 disabled:opacity-70 group overflow-hidden relative"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none"></div>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Access Account' : 'Confirm Membership'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="my-10 flex items-center gap-6">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">Instant Entry</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full py-4 bg-white border border-slate-100 rounded-[30px] flex items-center justify-center gap-4 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98] group shadow-sm hover:shadow-xl disabled:opacity-70"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <img src="https://www.google.com/favicon.ico" alt="google" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-125" />
            </div>
            <span className="text-slate-600 font-bold text-xs uppercase tracking-widest">Continue with Google</span>
          </button>

          <div className="mt-10 text-center">
             <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-500 font-bold text-sm tracking-tight hover:text-green-600 transition-colors"
             >
               {isLogin ? "Need an account? Join now" : "Already registered? Sign in"}
             </button>
             
             <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                   <ShieldCheck size={14} className="text-slate-400" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none pt-0.5">256-bit SSL Secure Auth</span>
                </div>
                <p className="text-[9px] text-slate-300 font-bold max-w-[240px] leading-relaxed uppercase tracking-wider">
                   Encrypted credentials. Shivani Store respects your data privacy.
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
