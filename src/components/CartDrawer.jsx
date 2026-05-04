import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, User, CheckCircle, CreditCard, Banknote, Sparkles, MapPin, Settings } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import emailjs from 'emailjs-com';

const CartDrawer = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    cartTotal,
    cartSavings,
    addToCart
  } = useCart();
  const { user, updateUserProfile } = useAuth();
  const { placeOrder } = useOrders();
  
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isConfirming, setIsConfirming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // For legacy users or editing existing
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [quickAddress, setQuickAddress] = useState(user?.user_metadata?.address || '');
  const [quickPhone, setQuickPhone] = useState(user?.user_metadata?.phone || '');

  // Reset form when user metadata changes or cart opens
  useEffect(() => {
    if (user?.user_metadata) {
      setQuickAddress(user.user_metadata.address || '');
      setQuickPhone(user.user_metadata.phone || '');
    }
  }, [user, isCartOpen]);

  const [isCartLoading, setIsCartLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Smart Up-selling: Prioritize related items based on cart content
  const upsellItems = (() => {
    const cartNames = cart.map(i => i.name.toLowerCase());
    const recommendations = [];
    
    // Logic: If Milk in cart, recommend Bread (or vice versa)
    if (cartNames.some(n => n.includes('milk')) && !cartNames.some(n => n.includes('bread'))) {
      const bread = products.find(p => p.name.toLowerCase().includes('bread'));
      if (bread) recommendations.push(bread);
    }
    if (cartNames.some(n => n.includes('bread')) && !cartNames.some(n => n.includes('milk'))) {
      const milk = products.find(p => p.name.toLowerCase().includes('milk'));
      if (milk) recommendations.push(milk);
    }
    
    // Fill rest with top products not in cart
    const others = products.filter(p => !cartNames.includes(p.name.toLowerCase()) && !recommendations.find(r => r.id === p.id));
    return [...recommendations, ...others].slice(0, 5);
  })();

  const deliveryFee = cartTotal >= 499 ? 0 : 30;
  const finalAmount = cartTotal + deliveryFee;
  const remaining = 499 - cartTotal;

  useEffect(() => {
    if (isCartOpen) {
      setIsCartLoading(true);
      const timer = setTimeout(() => setIsCartLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      toast('Please login to continue', { icon: '🔒' });
      navigate('/login');
      return;
    }

    if (!user?.user_metadata?.address && (!quickAddress.trim() || !quickPhone.trim())) {
      toast.error('Please enter your delivery details above to place order.');
      return;
    }

    setIsConfirming(true);
    setProgress(0);
  };

  const cancelConfirmation = () => {
    setIsConfirming(false);
    setProgress(0);
  };

  useEffect(() => {
    if (isConfirming) {
      if (progress < 100) {
        const interval = setInterval(() => setProgress(prev => prev + 2), 50);
        return () => clearInterval(interval);
      } else {
        executeOrder();
      }
    }
  }, [isConfirming, progress]);

  const executeOrder = async () => {
    try {
      const deliveryFee = cartTotal >= 499 ? 0 : 30;
      const finalTotal = cartTotal + deliveryFee;

      const formData = {
        name: user.user_metadata.full_name || 'Customer',
        phone: user.user_metadata.phone || quickPhone,
        address: user.user_metadata.address || quickAddress,
        city: 'Rajpura',
        pincode: user.user_metadata.pincode || '140401',
      };

      // Persist delivery details permanently if they were missing
      if (!user?.user_metadata?.address && quickPhone && quickAddress) {
        await updateUserProfile({
          phone: quickPhone,
          address: quickAddress,
          pincode: user?.user_metadata?.pincode || '140401'
        });
      }

      const order = await placeOrder(formData, cart, finalTotal, user.id);

      const templateParams = {
        to_name: "Shivani Karyana Store",
        from_name: formData.name,
        from_phone: formData.phone,
        from_address: `${formData.address} - ${formData.pincode}`,
        order_id: order.id,
        order_total: `₹${finalTotal}`,
        order_items: cart.map(item => `${item.quantity}x ${item.name}`).join('\n')
      };
      
      emailjs.send(
        'YOUR_SERVICE_ID', 
        'YOUR_TEMPLATE_ID', 
        templateParams, 
        'YOUR_PUBLIC_KEY'
      ).catch(() => {});

      setIsConfirming(false);
      setIsCartOpen(false); // Close the cart
      
      // Save current cart for navigation before clearing it
      const finalItems = [...cart];
      
      await clearCart();
      toast.success('Order placed successfully!');
      
      // Navigate to premium success screen
      navigate('/order-success', { 
        state: { 
          orderId: order.id, 
          items: finalItems,
          totalAmount: finalTotal,
          address: formData
        }
      });
    } catch (error) {
      toast.error('Failed to place order.');
      setIsConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[200] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <ShoppingBag className="text-[#d97706]" size={22} />
                  Your Cart
                </h2>
                {cart.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <AnimatePresence mode="wait">
                      {!showClearConfirm ? (
                        <motion.button 
                          key="clear-init"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => setShowClearConfirm(true)}
                          className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-black text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-all active:scale-95 uppercase tracking-wider"
                        >
                          <Trash2 size={12} /> Clear
                        </motion.button>
                      ) : (
                        <motion.div 
                          key="clear-confirm"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-1"
                        >
                          <button 
                            onClick={clearCart}
                            className="px-3 py-1 text-[10px] font-black text-white bg-red-500 hover:bg-red-600 rounded-full transition-all active:scale-95 uppercase tracking-wider"
                          >
                            Yes, Clear
                          </button>
                          <button 
                            onClick={() => setShowClearConfirm(false)}
                            className="px-2 py-1 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-wider"
                          >
                            No
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Visual Free Delivery Progress Bar */}
            {cart.length > 0 && (
              <div className="px-5 py-5 bg-white border-b border-gray-100 shadow-sm relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Shipping Goal</p>
                    {cartTotal >= 499 ? (
                      <p className="text-sm font-black text-green-600 flex items-center gap-1.5 animation-bounce-subtle">
                        <CheckCircle size={16} strokeWidth={3} /> FREE DELIVERY UNLOCKED
                      </p>
                    ) : (
                      <p className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <MapPin size={14} className="text-orange-500" /> Standard Delivery
                      </p>
                    )}
                  </div>
                  {cartTotal < 499 && (
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Remaining</p>
                      <p className="text-sm font-black text-orange-600">₹{499 - cartTotal}</p>
                    </div>
                  )}
                </div>

                {/* The Progress Bar */}
                <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((cartTotal / 499) * 100, 100)}%` }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.2)] ${
                      cartTotal >= 499 
                        ? 'bg-gradient-to-r from-green-400 to-green-600' 
                        : 'bg-gradient-to-r from-orange-400 to-orange-600'
                    }`}
                  >
                    {/* Glossy overlay effect */}
                    <div className="absolute inset-0 bg-white/20 w-full h-1/2 rounded-full" />
                  </motion.div>
                </div>

                {cartTotal < 499 ? (
                  <div className="mt-4 bg-orange-50/80 p-3 rounded-2xl border border-orange-100 flex items-center gap-3 transition-all">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Sparkles size={16} className="text-orange-500 animate-pulse" />
                    </div>
                    <p className="text-[11px] font-bold text-orange-800 leading-tight">
                      Add <span className="text-orange-600 font-black">₹{499 - cartTotal}</span> more to save <span className="font-black">₹30</span> on delivery charges!
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 bg-green-50/80 p-3 rounded-2xl border border-green-100 flex items-center gap-3 transition-all">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                    <p className="text-[11px] font-bold text-green-800 leading-tight">
                      Congratulations! You've qualified for <span className="font-black">FREE Delivery</span> on this order.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar bg-slate-50/50">
              {isCartLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-[20px] shadow-sm animate-pulse">
                      <div className="w-20 h-20 bg-gray-100 rounded-[14px]"></div>
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gray-100 rounded-full w-1/4"></div>
                        <div className="h-6 bg-gray-100 rounded-lg w-1/3 mt-3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <div className="w-24 h-24 bg-white rounded-full shadow-lg shadow-gray-100 flex items-center justify-center mb-2">
                    <ShoppingBag size={48} className="text-gray-300" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">Your cart is feeling light!</p>
                  <p className="text-sm">Time to stock up your pantry.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-8 py-3 bg-[#d97706] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="min-h-full flex flex-col">
                  {/* Item List */}
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="group flex gap-4 p-4 bg-white border border-transparent hover:border-orange-100 rounded-[20px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-8px_rgba(217,119,6,0.15)] transition-all duration-300">
                        <div className="w-20 h-20 rounded-[14px] overflow-hidden bg-slate-50 flex-shrink-0 relative">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-tight">{item.name}</h3>
                            <p className="text-[11px] font-medium text-gray-400 mt-1">{item.unit}</p>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-gray-900 text-base">₹{item.price}</span>
                              {item.discount > 0 && (
                                <span className="text-[10px] text-gray-400 line-through">₹{item.mrp}</span>
                              )}
                            </div>
                            
                            {/* Premium Quantity Selector */}
                            <div className="flex items-center bg-white border border-gray-100 shadow-sm rounded-xl p-1">
                              <button 
                                onClick={() => item.quantity === 1 ? removeFromCart(item.id, item.name) : updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-orange-50 rounded-lg text-gray-500 hover:text-orange-600 transition-colors active:scale-95"
                              >
                                {item.quantity === 1 ? <Trash2 size={12} className="text-red-400" /> : <Minus size={14} />}
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-green-50 rounded-lg text-gray-500 hover:text-green-600 transition-colors active:scale-95"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DYNAMIC SPACER: This expands to fill the gap */}
                  <div className="flex-1 min-h-[40px]" />

                  {/* BOTTOM GROUP: Upsell + Billing (Chipka Hua) */}
                  <div className="mt-8 space-y-0">
                    {/* Smart Upselling Slider */}
                    <div className="bg-white border border-gray-100 border-b-0 rounded-t-[32px] p-5 pb-2">
                       <div className="flex items-center gap-2 mb-4">
                          <Sparkles size={16} className="text-orange-400" />
                          <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">Don't Forget These</h3>
                       </div>
                       <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2">
                          {(() => {
                             const cartNames = cart.map(i => i.name.toLowerCase());
                             return upsellItems.filter(u => !cartNames.includes(u.name.toLowerCase()));
                          })().map(upsell => (
                              <div key={upsell.id} className="min-w-[130px] bg-slate-50/50 border border-transparent rounded-[24px] p-3 flex flex-col gap-2 shrink-0 transition-all hover:bg-white hover:border-orange-100 hover:shadow-md">
                                 <div className="w-16 h-16 mx-auto rounded-[16px] p-1 flex items-center justify-center">
                                   <img src={upsell.image} className="w-full h-full object-cover mix-blend-multiply" alt={upsell.name} />
                                 </div>
                                 <h4 className="text-[10px] font-bold text-gray-700 line-clamp-1 text-center">{upsell.name}</h4>
                                 <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-gray-900">₹{upsell.price}</span>
                                    <button 
                                      onClick={() => addToCart(upsell)}
                                      className="w-7 h-7 bg-white hover:bg-orange-500 hover:text-white rounded-full flex items-center justify-center text-orange-600 transition-all shadow-sm"
                                    >
                                      <Plus size={14} strokeWidth={3} />
                                    </button>
                                 </div>
                              </div>
                          ))}
                       </div>
                    </div>

                    {/* Billing & Address (Attached to Upsell) */}
                    <div className="bg-white border border-gray-100 border-t-0 rounded-b-[32px] p-5 pt-0 space-y-4 pb-12">
                      <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-medium">₹{cartTotal}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Delivery Fee</span>
                          {deliveryFee === 0 ? (
                            <span className="text-green-600 font-medium tracking-wide">FREE</span>
                          ) : (
                            <span className="font-medium text-gray-900">₹{deliveryFee}</span>
                          )}
                        </div>

                        <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-100">
                          <span>Total Amount</span>
                          <span>₹{finalAmount}</span>
                        </div>
                      </div>

                      {(user && (!user?.user_metadata?.address || showAddressForm)) ? (
                        <div className="bg-orange-50/30 rounded-2xl p-4 border border-orange-100 space-y-3">
                          <input 
                            type="tel" 
                            placeholder="Phone Number" 
                            value={quickPhone}
                            onChange={e => setQuickPhone(e.target.value)}
                            className="w-full text-sm p-3 rounded-xl border border-orange-100 focus:border-orange-500 outline-none font-medium text-gray-800 bg-white"
                          />
                          <textarea 
                            placeholder="Delivery Address" 
                            value={quickAddress}
                            onChange={e => setQuickAddress(e.target.value)}
                            rows="2"
                            className="w-full text-sm p-3 rounded-xl border border-orange-100 focus:border-orange-500 outline-none resize-none font-medium text-gray-800 bg-white"
                          />
                        </div>
                      ) : user && (
                        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivering To</p>
                          <p className="text-xs font-bold text-slate-800">{user.user_metadata.full_name || 'Customer'}</p>
                          <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{user.user_metadata.address}</p>
                          <button onClick={() => setShowAddressForm(true)} className="mt-2 text-[10px] font-black text-orange-600 uppercase">Change</button>
                        </div>
                      )}

                      {user && (user?.user_metadata?.address || quickAddress) && !showAddressForm && (
                        <div className="pt-2 grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => setPaymentMethod('cod')}
                              className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-xs ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400 whitespace-nowrap'}`}
                            >
                              <Banknote size={14} /> COD
                            </button>
                            <button 
                              onClick={() => setPaymentMethod('upi')}
                              className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-bold text-xs ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400 whitespace-nowrap'}`}
                            >
                              <CreditCard size={14} /> UPI
                            </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Bottom Footer: Place Order Action Only */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 bg-white p-4 pb-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] relative z-20">
                {isConfirming ? (
                  <div className="text-center">
                     <h3 className="font-bold text-gray-900 mb-1">Confirming your order...</h3>
                     <p className="text-sm text-gray-500 mb-6">Payment Method: {paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}</p>
                     
                     <div className="w-full h-12 bg-gray-100 rounded-2xl overflow-hidden relative shadow-inner mb-4">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-green-500"
                          style={{ width: `${progress}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center font-black text-white mix-blend-difference pointer-events-none">
                          Placing Order
                        </div>
                     </div>

                     <button 
                       onClick={cancelConfirmation}
                       className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl font-bold transition-colors"
                     >
                       Cancel
                     </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-[#d97706] hover:bg-[#c26a05] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98]"
                  >
                    {user ? (
                      <>Place Order <ArrowRight size={18} /></>
                    ) : (
                      <>Login to Checkout <User size={18} /></>
                    )}
                  </button>
                )}
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
