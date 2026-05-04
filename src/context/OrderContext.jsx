import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState(() => {
    // Only load initial state for anonymous/guest if needed, but since we map to user, better to start empty if no user, or load guest cart.
    // Let's rely on the effect below to set it.
    return [];
  });

  // Load orders from local storage when user changes
  useEffect(() => {
    const storageKey = user ? `shivani-orders-${user.id}` : 'shivani-orders-guest';
    const savedOrders = localStorage.getItem(storageKey);
    let parsedOrders = savedOrders ? JSON.parse(savedOrders) : [];

    // Migration Logic: Restore old orders if the user profile is empty
    if (parsedOrders.length === 0) {
      const oldOrdersStr = localStorage.getItem('shivani-orders');
      if (oldOrdersStr) {
        try {
          const oldOrders = JSON.parse(oldOrdersStr);
          if (oldOrders.length > 0) {
            // Give these old orders to the current user safely
            parsedOrders = oldOrders.map(order => ({ ...order, user_id: order.user_id || (user ? user.id : null) }));
          }
        } catch (e) {
             console.error("Migration parse error", e);
        }
      }
    }

    setOrders(parsedOrders);
  }, [user]);

  // Save orders to local storage when they change
  useEffect(() => {
    const storageKey = user ? `shivani-orders-${user.id}` : 'shivani-orders-guest';
    localStorage.setItem(storageKey, JSON.stringify(orders));
  }, [orders, user]);

  // Real-Time Cloud Sync: Listen for Admin updates!
  useEffect(() => {
    const channel = supabase
      .channel('customer_order_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const cloudOrder = payload.new;
        
        setOrders((prev) => prev.map((localOrder) => {
          if (localOrder.id.toLowerCase() === cloudOrder.id.toLowerCase()) {
             // Only toast if the status actually changed
             if (localOrder.status !== cloudOrder.status) {
               if (cloudOrder.status === 'Packed') {
                 toast.success(`Order #${localOrder.id} is now being Packed! 📦`);
               } else if (cloudOrder.status === 'Delivered') {
                 toast.success(`Order #${localOrder.id} has been Delivered! ✅`);
               }
             }
             // Update the local state instantly to disable the cancel button
             return { ...localOrder, status: cloudOrder.status };
          }
          return localOrder;
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const placeOrder = async (orderDetails, items, total, userId = null) => {
    const newOrder = {
      id: uuidv4().split('-')[0].toUpperCase(),
      date: new Date().toISOString(),
      status: 'Pending',
      items,
      total,
      address: orderDetails,
      user_id: userId
    };

    // Save to local state FIRST so checkout ALWAYS works
    setOrders((prev) => [newOrder, ...prev]);

    // Then attempt to sync to Supabase in background (fails gracefully if table not set up)
    try {
      const { error } = await supabase.from('orders').insert({
        id: newOrder.id.toLowerCase(),
        user_id: userId,
        customer_name: orderDetails.name,
        phone: orderDetails.phone,
        address: orderDetails.address,
        city: orderDetails.city,
        pincode: orderDetails.pincode,
        items: items,
        total: total,
        status: 'Pending'
      });
      if (error) {
        console.warn("⚠️ Cloud sync failed (run orders_schema.sql in Supabase to enable admin notifications):", error.message);
      }
    } catch (e) {
      console.warn("⚠️ Could not reach Supabase — order saved locally only.", e);
    }

    return newOrder;
  };

  const cancelOrder = async (orderId, reason = '') => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId && order.status === 'Pending') {
          return { ...order, status: 'Cancelled', cancel_reason: reason };
        }
        return order;
      })
    );
    
    // Sync cancellation to cloud so Admin sees it instantly
    try {
      // Safely attempt to update status AND cancellation reason
      const { error: fullError } = await supabase.from('orders').update({ 
        status: 'Cancelled',
        cancel_reason: reason 
      }).eq('id', orderId.toLowerCase());

      // If Postgres throws error 42703 (undefined_column), fallback to status only
      if (fullError && fullError.code === '42703') {
        console.warn("cancel_reason column missing in DB, falling back to basic status update");
        const { error: basicError } = await supabase.from('orders').update({ 
          status: 'Cancelled' 
        }).eq('id', orderId.toLowerCase());
        
        if (basicError) throw basicError;
      } else if (fullError) {
        throw fullError;
      }

      toast.success(`Order #${orderId} cancelled successfully`);
    } catch (e) {
      console.warn("Could not sync cancellation to cloud:", e);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, placeOrder, cancelOrder }}>
      {children}
    </OrderContext.Provider>
  );
};
