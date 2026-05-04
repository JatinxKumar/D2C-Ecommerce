import { CheckCircle, Clock, XCircle, Package, ArrowRight, MessageSquareX } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const OrderCard = ({ order }) => {
  const { cancelOrder } = useOrders();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Packed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delivered': return <CheckCircle size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-50">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm text-gray-500">Order ID:</span>
            <span className="font-mono font-bold text-gray-900">#{order.id}</span>
          </div>
          <p className="text-xs text-gray-400">{formattedDate}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          {order.status}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="hidden sm:flex w-16 h-16 bg-gray-50 rounded-xl items-center justify-center text-gray-400">
          <Package size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2">Items inside</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {order.items.slice(0, 3).map((item, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700">
                {item.quantity}x {item.name.substring(0, 15)}...
              </span>
            ))}
            {order.items.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-500">
                +{order.items.length - 3} more
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
              <p className="font-bold text-lg text-gray-900">₹{order.total}</p>
            </div>
            
            {order.status === 'Pending' && (
              <div className="relative">
                {!isCancelling ? (
                  <button 
                    onClick={() => setIsCancelling(true)}
                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors shadow-sm"
                  >
                    Cancel Order
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-2 bg-red-50 p-2 rounded-xl border border-red-100"
                  >
                    <div className="flex flex-col gap-2 w-full sm:w-64">
                      <select 
                        value={['I changed my mind', 'Found a better price elsewhere', 'Ordered by mistake', 'Delivery is taking too long', ''].includes(cancelReason) ? cancelReason : 'Other'}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'Other') {
                            setCancelReason(' '); // Set to a single space to trigger the 'Other' input
                          } else {
                            setCancelReason(val);
                          }
                        }}
                        className="px-3 py-2 text-sm rounded-lg border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-gray-700"
                      >
                        <option value="" disabled>Select a reason</option>
                        <option value="I changed my mind">I changed my mind</option>
                        <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                        <option value="Ordered by mistake">Ordered by mistake</option>
                        <option value="Delivery is taking too long">Delivery is taking too long</option>
                        <option value="Other">Other (Please specify)</option>
                      </select>

                      {!['I changed my mind', 'Found a better price elsewhere', 'Ordered by mistake', 'Delivery is taking too long', ''].includes(cancelReason) && (
                        <input 
                          type="text"
                          autoFocus
                          placeholder="Please specify your reason"
                          value={cancelReason === ' ' ? '' : cancelReason}
                          onChange={e => setCancelReason(e.target.value)}
                          className="px-3 py-2 text-sm rounded-lg border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 w-full bg-white text-red-900 placeholder-red-300"
                        />
                      )}
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button 
                        onClick={() => {
                          const finalReason = cancelReason.trim();
                          if (!finalReason) return;
                          cancelOrder(order.id, finalReason);
                          setIsCancelling(false);
                          setCancelReason('');
                        }}
                        disabled={!cancelReason.trim()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tighter"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => {
                          setIsCancelling(false);
                          setCancelReason('');
                        }}
                        className="px-4 py-2 bg-white border border-red-200 text-red-500 rounded-lg text-sm font-bold transition-colors uppercase tracking-tighter"
                      >
                        Back
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            
            {order.status === 'Cancelled' && order.cancel_reason && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-lg mt-2 sm:mt-0">
                <MessageSquareX size={14} className="text-red-500" />
                <span className="text-xs font-bold text-red-700 truncate max-w-[200px]">Reason: {order.cancel_reason}</span>
              </div>
            )}

            {order.status === 'Packed' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-blue-700">Under Process</span>
              </div>
            )}

            {order.status === 'Delivered' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle size={14} className="text-green-600" />
                <span className="text-sm font-bold text-green-700">Delivered ✅</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;
