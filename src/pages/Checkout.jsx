import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, Truck, MapPin, User, Phone, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import emailjs from 'emailjs-com';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const deliveryFee = cartTotal >= 499 ? 0 : 30;
  const finalTotal = cartTotal + deliveryFee;
  const remainingPrice = 499 - cartTotal;
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user?.user_metadata?.full_name && !formData.name) {
      setFormData(prev => ({ 
        ...prev, 
        name: user.user_metadata.full_name 
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await placeOrder(formData, cart, finalTotal, user?.id);

      // EmailJS parameters
      const templateParams = {
        to_name: "Shivani Karyana Store Admin",
        from_name: formData.name,
        from_phone: formData.phone,
        from_address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
        order_id: order.id,
        order_total: `₹${finalTotal}`,
        order_items: cart.map(item => `${item.quantity}x ${item.name}`).join('\n')
      };

      // Mocking the EmailJS response or failing gracefully if credentials aren't set
      await emailjs.send(
        'YOUR_SERVICE_ID', 
        'YOUR_TEMPLATE_ID', 
        templateParams, 
        'YOUR_PUBLIC_KEY'
      ).catch((err) => {
        console.warn("EmailJS not configured, but order placed successfully.", err);
      });

      setOrderPlaced(true);
      clearCart();
      toast.success('Order placed successfully!');
      
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md w-full">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#d97706]">
            <Lock size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-500 mb-6">
            Please log in or sign up to proceed to checkout and place your order.
          </p>
          <Link to="/login?redirect=/checkout" className="inline-block bg-[#d97706] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c26a05] transition-colors shadow-sm w-full">
            Log In or Sign Up
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-t-4 border-primary-500">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0"
          >
            <CheckCircle className="text-primary-500 w-10 h-10" />
          </motion.div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-500 mb-8">
            Thank you for shopping with Shivani Karyana Store. Your order details have been sent to our shop.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/orders')}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Track Order
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-primary-50 hover:bg-primary-100 text-primary-700 font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} /> Back to Cart
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-4">Checkout</h1>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Order Summary Form */}
          <div className="lg:col-span-7 mb-8 lg:mb-0">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="text-primary-500" /> Delivery Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10}"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white text-sm"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Complete Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="block w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white text-sm"
                    placeholder="House No, Building, Street Name..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="block w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white text-sm"
                      placeholder="e.g. New Delhi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{6}"
                      className="block w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50 focus:bg-white text-sm"
                      placeholder="e.g. 110001"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/30 text-lg font-bold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                >
                  {isSubmitting ? 'Placing Order...' : `Place Order (₹${finalTotal})`}
                </button>
              </form>
            </div>
          </div>

          {/* Cart Summary Panel */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  {cart.length} Items
                </span>
              </h2>
              
              <div className="max-h-64 overflow-y-auto pr-2 space-y-4 mb-6 hide-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="w-14 h-14 bg-gray-50 rounded-lg shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply rounded-lg" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</p>
                        <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-sm text-gray-900 shrink-0">₹{item.price * item.quantity}</p>
                  </div>
                ))}
                {cart.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Your cart is empty.</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span className="font-medium text-gray-900">₹{deliveryFee}</span>
                  )}
                </div>
                {deliveryFee > 0 && (
                   <div className="text-xs text-right text-gray-500">
                     Add <span className="font-bold text-[#d97706]">₹{remainingPrice}</span> more for FREE Delivery!
                   </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-4 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>
              
              <div className="mt-6 flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-100">
                <Truck className="text-green-600 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-green-900 text-sm">Free Delivery</h4>
                  <p className="text-green-700 text-xs mt-1">Get your order delivered in 15-30 minutes.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Checkout;
