import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { jioSections, products, featuredCollections } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import PremiumCarousel from '../components/PremiumCarousel';
import { useSearch } from '../context/SearchContext';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};

// Scroll Progress Bar Component
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 z-[100] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

// Floating Decorative Element
const FloatingElement = ({ children, className, delay = 0 }) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    {children}
  </motion.div>
);

// Section Header Component
const SectionHeader = ({ icon, title, subtitle, color = "gray", buttonText = "View All", onButtonClick, align = "left" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const colorMap = {
    gray: {
      title: "text-gray-900",
      subtitle: "text-gray-500",
      button: "text-blue-600 hover:text-blue-700",
      buttonBg: "bg-blue-50 hover:bg-blue-100",
      icon: ""
    },
    pink: {
      title: "text-rose-600",
      subtitle: "text-rose-400",
      button: "text-rose-600 hover:text-rose-700",
      buttonBg: "bg-rose-50 hover:bg-rose-100",
      icon: ""
    },
    green: {
      title: "text-emerald-700",
      subtitle: "text-emerald-500",
      button: "text-emerald-600 hover:text-emerald-700",
      buttonBg: "bg-emerald-50 hover:bg-emerald-100",
      icon: ""
    },
    purple: {
      title: "text-purple-700",
      subtitle: "text-purple-400",
      button: "text-purple-600 hover:text-purple-700",
      buttonBg: "bg-purple-50 hover:bg-purple-100",
      icon: ""
    },
    orange: {
      title: "text-orange-700",
      subtitle: "text-orange-500",
      button: "text-orange-600 hover:text-orange-700",
      buttonBg: "bg-orange-50 hover:bg-orange-100",
      icon: ""
    }
  };

  const colors = colorMap[color];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
      className={`flex items-center justify-between mb-6 md:mb-8 ${align === 'center' ? 'flex-col text-center gap-2' : ''}`}
    >
      <div>
        <motion.h2
          className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-3"
          variants={slideInLeft}
        >
          {icon && (
            <motion.span
              className="text-2xl md:text-3xl"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {icon}
            </motion.span>
          )}
          <span className={colors.title}>{title}</span>
        </motion.h2>
        <motion.p
          className={`text-sm font-semibold mt-1 ${colors.subtitle}`}
          variants={slideInLeft}
        >
          {subtitle}
        </motion.p>
      </div>
      <motion.button
        variants={slideInRight}
        whileHover={{ scale: 1.05, x: 5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onButtonClick}
        className={`${colors.button} ${colors.buttonBg} font-bold text-xs md:text-sm px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-2 group`}
      >
        {buttonText}
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          →
        </motion.span>
      </motion.button>
    </motion.div>
  );
};

// Animated Badge Component
const AnimatedBadge = ({ text, colorClass }) => (
  <motion.span
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
    className={`px-3 py-1 rounded-full text-xs font-black ${colorClass} shadow-lg`}
  >
    {text}
  </motion.span>
);

// Quick Stats Bar
const QuickStats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { icon: "🚚", text: "Free Delivery", subtext: "Orders above ₹199" },
    { icon: "⚡", text: "Express", subtext: "2hr Delivery" },
    { icon: "💰", text: "Best Prices", subtext: "Price Match" },
    { icon: "🔄", text: "Easy Returns", subtext: "7-day policy" }
  ];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={scaleIn}
          whileHover={{ scale: 1.03, y: -2 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <motion.span
              className="text-2xl"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
            >
              {stat.icon}
            </motion.span>
            <div>
              <p className="font-black text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{stat.text}</p>
              <p className="text-[10px] text-gray-400 font-medium">{stat.subtext}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Premium Product Section Wrapper
const PremiumSection = ({ children, variant = "default", className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  const variants = {
    default: "bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-500",
    pink: "bg-gradient-to-br from-rose-50 via-pink-50 to-white rounded-3xl p-5 md:p-8 shadow-sm border border-rose-100 hover:shadow-lg hover:shadow-rose-100/50 transition-all duration-500",
    green: "bg-gradient-to-br from-emerald-50 via-green-50 to-white rounded-3xl p-5 md:p-8 shadow-sm border border-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 transition-all duration-500",
    purple: "bg-gradient-to-br from-purple-50 via-violet-50 to-white rounded-3xl p-5 md:p-8 shadow-sm border border-purple-100 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-500",
    orange: "bg-gradient-to-br from-orange-50 via-amber-50 to-white rounded-3xl p-5 md:p-8 shadow-sm border border-orange-100 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-500",
    glass: "bg-white/70 backdrop-blur-xl rounded-3xl p-5 md:p-8 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-500"
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`${variants[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Product Scroll Container
const ProductScroll = ({ products, type = "default" }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const cardVariants = {
    default: "min-w-[170px] md:min-w-[210px] lg:min-w-[230px]",
    compact: "min-w-[150px] md:min-w-[180px]"
  };

  return (
    <div className="relative group/scroll">
      {/* Scroll Buttons */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-xl transition-all duration-300 opacity-0 group-hover/scroll:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-xl transition-all duration-300 opacity-0 group-hover/scroll:opacity-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-white/80 to-transparent z-[5] pointer-events-none rounded-l-3xl opacity-0 group-hover/scroll:opacity-100 transition-opacity" />
      <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-white/80 to-transparent z-[5] pointer-events-none rounded-r-3xl opacity-0 group-hover/scroll:opacity-100 transition-opacity" />

      <motion.div
        ref={scrollRef}
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex gap-4 md:gap-5 overflow-x-auto hide-scrollbar pb-3 items-stretch scroll-smooth"
      >
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            variants={fadeInUp}
            className={`${cardVariants[type]} flex flex-col`}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Category Grid Item
const CategoryItem = ({ item, onClick }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scaleIn}
      whileHover={{ scale: 1.08, y: -8 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2.5 w-20 sm:w-24 md:w-28 flex-shrink-0 cursor-pointer snap-start group"
    >
      <div className="relative w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] md:w-[100px] md:h-[100px]">
        {/* Animated Background Ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{
            background: [
              'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
              'conic-gradient(from 360deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)'
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Card Container */}
        <div className="relative w-full h-full bg-white rounded-2xl p-2 shadow-sm border border-gray-100 group-hover:border-transparent group-hover:shadow-xl transition-all duration-500 overflow-hidden m-[2px]">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-700 select-none pointer-events-none"
            draggable="false"
          />

          {/* Shine Effect on Hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
        </div>
      </div>

      <span className="text-[10px] sm:text-xs font-bold text-center leading-tight text-gray-600 group-hover:text-gray-900 line-clamp-2 uppercase tracking-wide transition-colors duration-300">
        {item.name}
      </span>
    </motion.div>
  );
};

// No Results Component
const NoResults = ({ query }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="py-20 text-center"
  >
    <FloatingElement>
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-6 text-5xl shadow-inner">
        🔍
      </div>
    </FloatingElement>
    <motion.h3
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-xl font-black text-gray-900 mb-2"
    >
      No products found
    </motion.h3>
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-gray-500 font-medium"
    >
      Try searching for "{query}" with different keywords
    </motion.p>
  </motion.div>
);

// Main Home Component
const Home = () => {
  const { searchQuery } = useSearch();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: mainRef, offset: ["start start", "end end"] });

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const heroBanners = [

    {
      id: 2,
      title: "WOW DEALS",
      subtitle: "Today's Best Offers",
      badge: "Exclusive",
      image: "https://media.istockphoto.com/id/909970702/photo/black-rock-texture.webp?a=1&b=1&s=612x612&w=0&k=20&c=Ia6BQXRRHnk0Ff2PY4ipQb7laKV4cpfaVbESBWtB0D8=",
      color: "from-red-900/90",
      badgeColor: "bg-white text-red-600 shadow-lg shadow-red-500/20"
    },
    {
      id: 3,
      title: "DRY FRUIT DELIGHTS",
      subtitle: "Premium Quality Nuts & Berries",
      badge: "Gourmet",
      image: "https://plus.unsplash.com/premium_photo-1668677227454-213252229b73?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZHJ5JTIwZnJ1aXRzfGVufDB8fDB8fHww",
      color: "from-orange-950/90",
      badgeColor: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30",
    }, {
      id: 1,
      title: "SUMMER SAVINGS",
      subtitle: "Upto 50% Off on Beverages",
      badge: "Big Savings",
      image: "https://images.unsplash.com/photo-1665359045452-bfa257a2a6bf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNvZnQlMjBkcmlua3xlbnwwfHwwfHx8MA%3D%3D",
      color: "from-blue-900/90",
      badgeColor: "bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/30"
    },
    {
      id: 5,
      title: "SUNRISE BREAKFAST",
      subtitle: "Start Your Day with Freshness",
      badge: "Dairy Fresh",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=1200",
      color: "from-blue-950/90",
      badgeColor: "bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg shadow-blue-500/30",
      link: "/shop?category=c1" // Opens Chips & Namkeens
    },
    {
      id: 6,
      title: "FLAT 30% OFF ON YOUR 1ST ORDER!",
      subtitle: "Use Code: WELCOME30 | Free Delivery included.",
      badge: "New User Offer",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      color: "from-orange-600/90",
      badgeColor: "bg-gradient-to-r from-yellow-300 to-red-500 text-black shadow-lg font-black tracking-widest"
    },
    {
      id: 7,
      title: "BEAT THE HEAT! 🍦",
      subtitle: "Up to 40% OFF on Beverages, Ice Creams & Cold Drinks.",
      badge: "Summer Essentials",
      image: "https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=1200&q=80",
      color: "from-cyan-900/90",
      badgeColor: "bg-gradient-to-r from-cyan-300 to-blue-500 text-black font-black"
    },
    {
      id: 8,
      title: "MONTH-END RATION SALE! 🌾",
      subtitle: "Save up to ₹500 on Monthly Groceries.",
      badge: "Best Price Guarantee",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
      color: "from-green-900/90",
      badgeColor: "bg-green-500 text-white shadow-lg shadow-green-500/20"
    },
    {
      id: 9,
      title: "MEGA SAVER COMBO! 📢",
      subtitle: "With every 10kg Fortune Chakki Atta pack.",
      badge: "FREE 500g Fortune Besan",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
      color: "from-yellow-600/80",
      badgeColor: "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.8)] font-black animate-pulse"
    },
    {
      id: 10,
      title: "LIGHTNING FAST DELIVERY! ⚡",
      subtitle: "Get your groceries in 15-30 minutes at your doorstep.",
      badge: "Superfast Service",
      image: "https://plus.unsplash.com/premium_photo-1669130744503-4939a5bcef43?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aW5kaWFuJTIwc3BpY2VzfGVufDB8fDB8fHww",
      color: "from-indigo-900/90",
      badgeColor: "bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)] font-black"
    }
  ];

  return (
    <div className="w-full bg-gradient-to-b from-[#f0f7ff] via-[#f8fbff] to-[#f3f9ff] pb-24" ref={mainRef}>
      <ScrollProgress />

      {/* Main Content */}
      {searchQuery ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="flex items-center gap-2 bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100">
              <span className="text-gray-400">🔍</span>
              <span className="text-gray-500 text-sm">Results for</span>
              <span className="font-black text-gray-900">"{searchQuery}"</span>
            </div>
            <span className="text-sm text-gray-400 font-medium">
              {filteredProducts.length} items
            </span>
          </motion.div>

          {filteredProducts.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5"
            >
              {filteredProducts.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <NoResults query={searchQuery} />
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-0 space-y-8 md:space-y-12">

          {/* Premium Hero Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <PremiumCarousel heroBanners={heroBanners} />
          </motion.div>

          {/* Quick Stats */}
          <QuickStats />

          {/* Summer Savings Section */}
          <PremiumSection variant="default">
            <SectionHeader
              icon="☀️"
              title="Summer Savings"
              subtitle="Chill out with these cool deals"
              color="gray"
            />
            <ProductScroll products={featuredCollections.summerSavings} />
          </PremiumSection>

          {/* Wow Deals Section */}
          <PremiumSection variant="pink">
            <SectionHeader
              icon="🔥"
              title="Wow Deals"
              subtitle="Unbeatable prices for today"
              color="pink"
              buttonText="See More"
            />
            <ProductScroll products={featuredCollections.wowDeals} />
          </PremiumSection>

          {/* Premium Banner CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white"
          >
            {/* Animated Background Elements */}
            <FloatingElement className="absolute top-4 right-8 text-6xl opacity-20" delay={0}>
              🛒
            </FloatingElement>
            <FloatingElement className="absolute bottom-4 left-8 text-5xl opacity-20" delay={1}>
              ✨
            </FloatingElement>
            <FloatingElement className="absolute top-1/2 right-1/4 text-4xl opacity-15" delay={2}>
              🎉
            </FloatingElement>

            {/* Moving Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <motion.h3
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl md:text-3xl lg:text-4xl font-black mb-2"
                >
                  Get 20% Off Your First Order!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-white/80 font-medium"
                >
                  Use code <span className="font-black bg-white/20 px-2 py-0.5 rounded-md">WELCOME20</span> at checkout
                </motion.p>
              </div>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/shop')}
                className="bg-white text-purple-600 font-black px-8 py-4 rounded-2xl shadow-xl text-sm md:text-base hover:bg-gray-50 transition-colors"
              >
                Shop Now
              </motion.button>
            </div>
          </motion.div>

          {/* Category Sections */}
          {jioSections.map((section, idx) => {
            const sectionVariants = ['default', 'green', 'purple', 'orange', 'glass'];
            const variant = sectionVariants[idx % sectionVariants.length];
            const colorOptions = ['gray', 'green', 'purple', 'orange', 'gray'];
            const color = colorOptions[idx % colorOptions.length];

            return (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <SectionHeader
                    title={section.title}
                    subtitle={`Explore our ${section.title.toLowerCase()} collection`}
                    color={color}
                  />
                </motion.div>

                <motion.div
                  variants={staggerContainer}
                  className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x"
                >
                  {section.items.map(item => (
                    <CategoryItem
                      key={item.id}
                      item={item}
                      onClick={() => navigate(`/category/${item.id}`)}
                    />
                  ))}
                </motion.div>
              </motion.div>
            );
          })}

          {/* Footer Promo Section */}
          <PremiumSection variant="glass" className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                Discover More Categories
              </h3>
              <p className="text-gray-500 font-medium mb-6 max-w-md mx-auto">
                From daily essentials to premium products, find everything you need
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/shop')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-shadow"
              >
                Explore All
              </motion.button>
            </motion.div>
          </PremiumSection>

        </div>
      )}
    </div>
  );
};

export default Home;