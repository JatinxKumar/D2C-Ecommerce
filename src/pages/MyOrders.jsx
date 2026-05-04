import { useState, useMemo } from 'react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';
import { PackageOpen, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const { orders } = useOrders();
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');

  const filteredOrders = useMemo(() => {
    if (filter === 'All') return orders;
    return orders.filter(order => order.status === filter);
  }, [orders, filter]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md w-full">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#d97706]">
            <Lock size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-500 mb-6">
            Please log in to view your order history and track your current orders.
          </p>
          <Link to="/login" className="inline-block bg-[#d97706] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c26a05] transition-colors shadow-sm w-full">
            Log In or Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-2">View and manage your recent purchases.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
          {['All', 'Pending', 'Packed', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status} {status !== 'All' && `(${orders.filter(o => o.status === status).length})`}
            </button>
          ))}
        </div>

        <div>
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm mt-8">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <PackageOpen size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No previous orders</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {filter === 'All' 
                  ? "You haven't placed any orders yet. Start shopping to see your orders here."
                  : `You don't have any ${filter.toLowerCase()} orders right now.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
