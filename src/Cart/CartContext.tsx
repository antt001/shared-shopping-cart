import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore as db } from '../firebase-config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';


interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  timestamp: number;
}

interface UserCart {
  id: string;
  users: string[];
  items: CartItem[];
}

interface UserCartsMap {
  [key: string]: UserCart;
}

interface CartContextType {
  cartUsers: string[];
  userCarts: UserCartsMap;
  selectedCart: string | null;
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setCartUsers: (users: string[]) => void;
  selectCart: (id: string) => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCart, setSelectedCart] = useState<string | null>(null);
  const [cartUsers, setCartUsers] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userCarts, setUserCarts] = useState<UserCartsMap>({});
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchCarts(currentUser.uid);
      } else {
        setLoading(false); // No user, loading complete
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && selectedCart && !loading) {
      saveCart(selectedCart, cartItems);
    }
  }, [cartItems, user, selectedCart, loading]);

  const fetchCarts = async (userId: string) => {
    const carts = await fetchUserCarts(userId);
    await loadCart(userId);
    if (Object.keys(carts).length > 0 || selectedCart) {
      setUserCarts({
        ...carts,
        [userId]: { id: userId, items: cartItems, users: cartUsers }
      });
    }
    setLoading(false); // Loading complete
  }

  const selectCart = (cartId: string) => {
    setLoading(true);
    const cart: UserCart = userCarts[cartId];
    if (cart) {
      setSelectedCart(cartId);
      setCartItems(cart.items);
      setCartUsers(cart.users);
    }
    setLoading(false);
  }

  const fetchUserCarts = async (userId: string) => {
    const cartsCollection = collection(db, 'carts');
    const userCartsQuery = query(cartsCollection, where('users', 'array-contains', userId));
    const userCartsSnapshot = await getDocs(userCartsQuery);

    const cartsList = userCartsSnapshot.docs.reduce((acc, doc) => ({
      ...acc,
      [doc.id]: {
        id: doc.id,
        items: doc.data().items,
        users: doc.data().users
      }
    }), {});
    return cartsList;
  };

  const loadCart = async (userId: string) => {
    console.log('Loading cart for user:', userId);
    const cartDoc = await getDoc(doc(db, 'carts', userId));
    if (cartDoc.exists()) {
      const loadedItems = cartDoc.data().items
      const cartSharedWith = cartDoc.data().users || [];
      setSelectedCart(userId);
      setCartUsers(cartSharedWith);
      setCartItems(loadedItems || []);
    }
  };

  const saveCart = async (id: string, items: CartItem[]) => {
    await setDoc(doc(db, 'carts', id), { items }, { merge: true });
  };

  const addItem = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        // If the item already exists, increase its quantity
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // If the item doesn't exist, add it to the cart
        return [...prevItems, item];
      }
    });
    if (selectedCart) {
      setUserCarts((prevCarts) => {
        return {
          ...prevCarts,
          [selectedCart]: {
            ...prevCarts[selectedCart],
            items: [...prevCarts[selectedCart].items, item]
          }
        }
      })
    }
    
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartUsers, 
      cartItems, 
      userCarts, 
      selectedCart, 
      addItem, 
      updateItemQuantity, 
      removeItem, 
      clearCart, 
      setCartUsers, 
      selectCart,
      subtotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
