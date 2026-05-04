import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Gift, Clock, Tag, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

const OffersPage = () => {
  const { cartTotal, addToCart } = useCart();
  const navigate = useNavigate();
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);

  // Progress logic
  const goal = 500;
  const progressPercent = Math.min((cartTotal / goal) * 100, 100);

  useEffect(() => {
    if (cartTotal >= goal && !hasFiredConfetti) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      setHasFiredConfetti(true);
    } else if (cartTotal < goal) {
      setHasFiredConfetti(false); // Reset if it goes below
    }
  }, [cartTotal, hasFiredConfetti]);

  const handleAddCombo = (combo) => {
    addToCart({ id: combo.name, name: combo.name, price: combo.price, image: 'https://via.placeholder.com/150' });
    toast.success(`${combo.name} added to cart!`);
  };

  const handleAdd1RupeeItem = (item) => {
    if (cartTotal >= 500) {
      addToCart({ id: item.name, name: item.name, price: 1, image: 'https://via.placeholder.com/150' });
      toast.success(`${item.name} added for ₹1!`);
    } else {
      toast.error('Add ₹' + (500 - cartTotal).toFixed(0) + ' more to unlock the ₹1 Store!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      
      {/* 5 - Lucky Draw Banner */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Gift size={120} />
        </div>
        <div className="relative z-10 w-full md:w-2/3">
          <div className="bg-white/20 inline-block px-3 py-1 rounded-full text-sm font-bold tracking-widest mb-4 uppercase backdrop-blur-sm shadow-sm ring-1 ring-white/30 text-white">
            Mega Giveaway
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            The Big Lucky Draw! 🎉
          </h1>
          <p className="text-lg md:text-xl font-medium mb-6 opacity-90">
            Be one of the 3 lucky customers to win <strong className="text-yellow-200">5KG Sugar FREE!</strong> 
            <br />Just shop for ₹2000 or more this week.
          </p>
          <div 
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 font-bold bg-white text-orange-600 px-6 py-3 rounded-full w-max shadow-md cursor-pointer hover:scale-105 transition-transform"
          >
            Start Shopping <ShoppingCart size={20}/>
          </div>
        </div>
      </div>

      {/* 2 - The 1 Rupee Store */}
      <section className="bg-yellow-50 rounded-2xl p-6 md:p-8 border-2 border-yellow-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-400 text-yellow-900 p-3 rounded-full">
            <Tag size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-yellow-900">The 1 Rupee Store 🪙</h2>
            <p className="text-yellow-700 font-medium">Orders over ₹500 unlock premium essentials for just ₹1!</p>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="mb-6 bg-white rounded-xl p-4 md:p-6 border border-yellow-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-gray-500 text-sm font-medium">Your Cart Value</p>
              <p className="text-2xl font-bold">₹{cartTotal.toFixed(0)}</p>
            </div>
            <div className="text-right">
              {cartTotal >= goal ? (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200 shadow-sm">
                  <Check size={16}/> ₹1 Store Unlocked!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold border border-yellow-200">
                  Add ₹{(goal - cartTotal).toFixed(0)} to unlock
                </span>
              )}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 md:h-4 overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-700 ease-out ${cartTotal >= goal ? 'bg-green-500' : 'bg-orange-500'}`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-medium mt-2">
            <span>₹0</span>
            <span>Target: ₹500</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 1, name: '100g Fresh Dhaniya', originalPrice: 15, image: '🌿' },
            { id: 2, name: 'Homelite Matchbox Pack', originalPrice: 10, image: '🔥' },
          ].map(item => (
            <div key={item.id} className={`flex items-center justify-between bg-white p-4 rounded-xl border ${cartTotal >= goal ? 'border-green-300 shadow-sm' : 'border-yellow-200'} transition-all`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg text-2xl">
                  {item.image}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`font-extrabold text-lg ${cartTotal >= goal ? 'text-green-600' : 'text-gray-400'}`}>₹1</span>
                    <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleAdd1RupeeItem(item)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  cartTotal >= goal 
                  ? 'bg-green-500 text-white hover:bg-green-600 shadow border-b-4 border-green-700 active:translate-y-1 active:border-b-0' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Claim
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3 - Emergency Kits (Combo Offers) */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Clock className="text-red-500" size={28} />
          <h2 className="text-2xl font-bold text-gray-800">Emergency Kits 🚨</h2>
        </div>
        <p className="text-gray-600 mb-6 font-medium">One-click solutions for unexpected guests or sudden needs.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kit 1 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-100 rounded-full opacity-50 z-0"></div>
            <div className="relative z-10">
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">Best for Guests</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Chai-Pakora Kit ☕</h3>
              <p className="text-gray-500 text-sm mb-4">Everything you need for perfect evening snacks.</p>
              
              <ul className="space-y-2 mb-6">
                {['Taj Mahal Tea (250g)', 'Sugar (1kg)', 'Besan (500g)', 'Haldiram Bhujia (400g)'].map((i, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Plus size={14} className="text-orange-500" /> {i}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900">₹199</span>
                  <span className="text-xs text-gray-400 line-through">₹285 original</span>
                </div>
                <button 
                  onClick={() => handleAddCombo({name: 'Chai-Pakora Kit', price: 199})}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-md"
                >
                  Add Combo
                </button>
              </div>
            </div>
          </div>

          {/* Kit 2 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 z-0"></div>
            <div className="relative z-10">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">Instant Refresh</span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cleaning Kit 🧼</h3>
              <p className="text-gray-500 text-sm mb-4">Complete bathroom and kitchen cleaning essentials.</p>
              
              <ul className="space-y-2 mb-6">
                {['Harpic Original (500ml)', 'Vim Bar (300g)', 'Scotch Brite Scrub (2 Pcs)'].map((i, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Plus size={14} className="text-blue-500" /> {i}
                  </li>
                ))}
              </ul>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-900">₹149</span>
                  <span className="text-xs text-gray-400 line-through">₹190 original</span>
                </div>
                <button 
                  onClick={() => handleAddCombo({name: 'Cleaning Kit', price: 149})}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-md"
                >
                  Add Combo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 - Pocket-Friendly Slots */}
      <section className="bg-slate-800 rounded-3xl p-6 md:p-10 text-white text-center shadow-lg">
        <h2 className="text-3xl font-extrabold mb-3">Pocket-Friendly Slots 💸</h2>
        <p className="text-slate-300 font-medium mb-8 max-w-2xl mx-auto">
          Running low on budget this month? Don't worry. Explore our highly curated slots to find what fits your pocket.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/shop?maxPrice=49')}
            className="w-full sm:w-auto bg-gradient-to-br from-green-400 to-green-600 p-[3px] rounded-2xl group active:scale-95 transition-transform shadow-green-500/30 shadow-lg"
          >
            <div className="bg-slate-900 rounded-[14px] px-8 py-6 h-full w-full group-hover:bg-opacity-90 transition-all flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-green-400 mb-1">Under ₹49</span>
              <span className="text-sm font-medium text-slate-300">Biscuits, Chocolates, Maggi 🍫</span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/shop?maxPrice=99')}
            className="w-full sm:w-auto bg-gradient-to-br from-blue-400 to-indigo-600 p-[3px] rounded-2xl group active:scale-95 transition-transform shadow-indigo-500/30 shadow-lg"
          >
            <div className="bg-slate-900 rounded-[14px] px-8 py-6 h-full w-full group-hover:bg-opacity-90 transition-all flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-blue-400 mb-1">Under ₹99</span>
              <span className="text-sm font-medium text-slate-300">Oil, Pulses, Soaps 🫘</span>
            </div>
          </button>
        </div>
      </section>

    </div>
  );
};

export default OffersPage;
