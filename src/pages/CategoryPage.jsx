import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, SearchX, ArrowDownUp } from 'lucide-react';
import { products, jioSections } from '../data/mockData';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('recommended');

  // Find the subcategory name from jioSections for the header
  let categoryName = "Category";
  for (const section of jioSections) {
    const found = section.items.find((item) => item.id === id);
    if (found) {
      categoryName = found.name;
      break;
    }
  }

  // Filter products by this subcategory
  const categoryProducts = products.filter(p => p.categoryId === id);

  // Apply sorting
  const sortedProducts = [...categoryProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0; // recommended uses original order
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-primary-600 hover:-translate-x-1"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{categoryName}</h1>
          </div>
        </div>

        {categoryProducts.length > 0 ? (
          <>
            {/* Sort Strip */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="text-sm font-semibold text-gray-700">
                <span className="text-primary-600">{categoryProducts.length}</span> Products found
              </div>
              <div className="flex items-center gap-2">
                <ArrowDownUp size={16} className="text-gray-400" />
                <span className="hidden sm:inline text-xs text-gray-500 font-medium">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm mt-8">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <SearchX size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              We couldn't find any items in <span className="font-semibold text-gray-700">{categoryName}</span> right now. Please check back later or browse other categories.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
