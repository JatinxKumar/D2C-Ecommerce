import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { products, jioSections } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { Filter, X, ChevronRight } from 'lucide-react';

// Extract all categories from jioSections and flatten them
const allCategories = [
  { id: 'all', name: 'All Products', image: '🛒' }, // Special "All" category
  ...jioSections.flatMap(section => section.items)
];

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse category and maxPrice from URL query param if present
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get('category') || 'all';
  const initialMaxPrice = queryParams.get('maxPrice') ? Number(queryParams.get('maxPrice')) : null;

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(24); // Start with 24 items for better performance

  // Sync state with URL to allow sharing specific category links
  useEffect(() => {
    setActiveCategory(initialCategory);
    setMaxPrice(initialMaxPrice);
    setDisplayLimit(24); // Reset limit on navigation
  }, [initialCategory, initialMaxPrice]);

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    setMaxPrice(null); 
    setDisplayLimit(24); // Reset limit on category change
    setIsMobileMenuOpen(false); 
    // Update URL without full page reload
    navigate(`/shop${categoryId === 'all' ? '' : `?category=${categoryId}`}`, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter(product => product.categoryId === activeCategory);
    }
    if (maxPrice) {
      result = result.filter(product => product.price <= maxPrice);
    }
    return result;
  }, [activeCategory, maxPrice]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayLimit);
  }, [filteredProducts, displayLimit]);

  const activeCategoryData = allCategories.find(c => c.id === activeCategory);
  const pageTitle = maxPrice 
    ? `Products under ₹${maxPrice}` 
    : (activeCategoryData?.name || 'All Products');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative pt-20">
      
      {/* --- MOBILE: Filter Toggle Button --- */}
      <div className="md:hidden sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="font-bold text-gray-800 flex items-center gap-2">
           {activeCategoryData?.image && activeCategoryData.id !== 'all' ? (
             <img src={activeCategoryData.image} alt="" className="w-6 h-6 rounded-full object-cover" />
           ) : (
             <span className="text-xl">🛒</span>
           )}
           {pageTitle}
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
        >
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* --- SIDEBAR: Desktop (Fixed) & Mobile (Overlay) --- */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 768) && (
          <>
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="fixed inset-0 bg-black/50 z-40 md:hidden"
                 onClick={() => setIsMobileMenuOpen(false)}
               />
            )}
            
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed md:sticky top-0 md:top-16 left-0 h-full md:h-[calc(100vh-64px)] w-[280px] bg-white border-r border-gray-100 flex flex-col z-50 md:z-10 shadow-2xl md:shadow-none"
            >
              {/* Sidebar Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white pt-20 md:pt-6">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Categories</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="md:hidden p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Category List */}
              <div className="overflow-y-auto flex-1 p-3 space-y-1 hide-scrollbar">
                {allCategories.map((category) => {
                  const isActive = activeCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 shadow-sm border border-blue-200/50' 
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      {/* Category Icon/Image */}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm overflow-hidden bg-white border ${isActive ? 'border-blue-200' : 'border-gray-100'}`}>
                        {category.id === 'all' ? (
                          <span className="text-xl">{category.image}</span>
                        ) : (
                          <img src={category.image} alt="" className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                        )}
                      </div>
                      
                      {/* Category Name */}
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'}`}>
                          {category.name}
                        </p>
                      </div>

                      {/* Active Indicator Chevron */}
                      {isActive && (
                        <motion.div layoutId="activeTab" className="text-blue-500">
                          <ChevronRight size={18} />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-8 w-full md:w-auto overflow-x-hidden min-h-screen">
        
        {/* Header Block */}
        <div className="mb-8 bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 opacity-60 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight"
              >
                {pageTitle}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-gray-500 font-medium mt-2"
              >
                Showing {filteredProducts.length} delicious {filteredProducts.length === 1 ? 'item' : 'items'}
              </motion.p>
            </div>
            
            {/* Quick Stats Pill */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
               className="bg-green-50 text-green-700 font-bold px-4 py-2 rounded-xl text-sm border border-green-200 self-start md:self-auto inline-flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              In Stock & Ready to Delivery
            </motion.div>
          </div>
        </div>

        {/* Product Grid */}
        {visibleProducts.length > 0 ? (
          <>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
            >
              {visibleProducts.map(product => (
                <motion.div key={product.id} variants={cardVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
            
            {/* Show More Button */}
            {displayLimit < filteredProducts.length && (
              <div className="mt-12 flex justify-center pb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDisplayLimit(prev => prev + 24)}
                  className="bg-white border-2 border-blue-100 text-blue-600 font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:border-blue-200 transition-all flex items-center gap-3 group"
                >
                  <span className="text-lg">✨</span>
                  SHOW MORE PRODUCTS
                  <span className="text-gray-400 group-hover:text-blue-500 transition-colors">({filteredProducts.length - displayLimit} remaining)</span>
                </motion.button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200"
          >
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found here yet!</h3>
            <p className="text-gray-500 font-medium max-w-sm">
              We are constantly adding new items to our store. Check back later or browse other categories.
            </p>
            <button 
              onClick={() => handleCategorySelect('all')}
              className="mt-6 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition"
            >
              Browse All Products
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Shop;
