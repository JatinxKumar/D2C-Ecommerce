import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { products } from '../data/mockData';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 0. Load initial cart from LocalStorage on user change
  useEffect(() => {
    const storageKey = user ? `shivani-cart-${user.id}` : 'shivani-cart-guest';
    const savedCart = localStorage.getItem(storageKey);
    setCart(savedCart ? JSON.parse(savedCart) : []);
  }, [user]);

  // 1. Persist to LocalStorage
  useEffect(() => {
    const storageKey = user ? `shivani-cart-${user.id}` : 'shivani-cart-guest';
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, user]);

  // 2. Cloud Sync: Fetch on Login
  useEffect(() => {
    const fetchCloudCart = async () => {
      if (!user) return;
      
      setIsSyncing(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cloud cart:', error);
      } else if (data && data.length > 0) {
        // Merge local guest cart with cloud cart
        setCart(prev => {
          const merged = [...data.map(item => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
            mrp: item.mrp,
            quantity: item.quantity,
            image: item.image
          }))];

          // If guest items exist that are NOT in cloud, we should ideally push them
          // For now, cloud cart takes precedence
          return merged;
        });
      }
      setIsSyncing(false);
    };

    fetchCloudCart();
  }, [user]);

  // 3. Helper to Push to Cloud
  const syncToCloud = useCallback(async (newCart) => {
    if (!user) return;

    // This is a simple implementation: clear and re-insert or use upsert
    // For performance, we only sync changes, but for a simple store, upsert is easier
    const cartData = newCart.map(item => ({
      user_id: user.id,
      product_id: item.id,
      name: item.name,
      price: item.price,
      mrp: item.mrp,
      quantity: item.quantity,
      image: item.image
    }));

    // Strategy: Delete removed items and upsert existing
    // Simplest: Replace all for this user (small cart size < 50 items usually)
    const { error } = await supabase
      .from('cart_items')
      .upsert(cartData, { onConflict: 'user_id,product_id' });

    if (error) console.error('Cloud sync error:', error);
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    let isNew = false;
    let updatedCart = [];

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        updatedCart = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        isNew = true;
        updatedCart = [...prev, { ...product, quantity }];
      }
      return updatedCart;
    });

    if (isNew) {
      toast.success(`Added ${product.name} to cart`);
    } else {
      toast.success(`Increased ${product.name} quantity`);
    }

    if (user) {
      await supabase.from('cart_items').upsert({
        user_id: user.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp,
        quantity: cart.find(i => i.id === product.id)?.quantity + quantity || quantity,
        image: product.image
      }, { onConflict: 'user_id,product_id' });
    }
  };

  const removeFromCart = async (id, name) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.error(`Removed ${name} from cart`);

    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id);
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );

    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', id);
    }
  };
  
  const clearCart = async () => {
    setCart([]);
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
    }
  };

  const ALIASES = {
    'pyaaz': 'fresh onion',
    'tamatar': 'fresh tomato',
    'adrak': 'fresh ginger',
    'lahsun': 'fresh garlic',
    'garlic': 'fresh garlic',
    'ginger': 'fresh ginger',
    'onion': 'fresh onion',
    'tomato': 'fresh tomato',
    'cheeni': 'loose sugar',
    'namak': 'tata salt',
    'doodh': 'amul taaza milk',
    'makhan': 'amul butter',
    'dahi': 'curd',
    'cola': 'coca cola',
    'coke': 'coca cola',
    'code': 'coca cola',
    'limca': 'limca soft drink',
    'bread': 'britannia classic white bread',
    'milk': 'amul taaza milk',
    'maggi': 'maggi 2-minute noodles',
    'coffee': 'nescafe classic instant coffee'
  };

  const addByName = (productSearch, quantity = 1) => {
    let searchTerm = productSearch.toLowerCase().trim();
    
    // 1. Resolve Alias
    if (ALIASES[searchTerm]) {
      searchTerm = ALIASES[searchTerm];
    }

    // 2. Ranking Logic
    // Rank 1: Exact Name Match
    let found = products.find(p => p.name.toLowerCase() === searchTerm);
    
    // Rank 2: Exact Name Contains Search Term (as whole word)
    if (!found) {
      found = products.find(p => {
        const words = p.name.toLowerCase().split(' ');
        return words.includes(searchTerm);
      });
    }

    // Rank 3: Name starts with search term
    if (!found) {
      found = products.find(p => p.name.toLowerCase().startsWith(searchTerm));
    }

    // Rank 4: Fuzzy includes (the fallback)
    if (!found) {
      found = products.find(p => p.name.toLowerCase().includes(searchTerm) || searchTerm.includes(p.name.toLowerCase()));
    }

    // Rank 5: Multi-word match
    if (!found) {
      const terms = searchTerm.split(' ');
      found = products.find(p => terms.every(term => p.name.toLowerCase().includes(term)));
    }

    if (found) {
      addToCart(found, quantity);
      return { success: true, product: found };
    }
    return { success: false, name: productSearch };
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const cartSavings = cartSubtotal - cartTotal;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartSubtotal,
        cartSavings,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        addByName
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
