import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore as db } from '../firebase-config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';


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
  userCarts: UserCartsMap;
  selectedCart: string | null;
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
  const [selectedCart, setSelectedCart] = useState<string | null>(null);
  const [userCarts, setUserCarts] = useState<UserCartsMap>({});
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // setUser(currentUser);
      if (currentUser) {
        fetchCarts(currentUser.uid);
      } else {
        setLoading(false); // No user, loading complete
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedCart && !loading) {
      saveCart(selectedCart, userCarts[selectedCart].items);
    }
  }, [userCarts, selectedCart, loading]);

  const fetchCarts = async (userId: string) => {
    const carts = await fetchUserCarts(userId);
    await loadCart(userId);
    if (Object.keys(carts).length > 0) {
      setUserCarts((prevCarts) => ({
        ...prevCarts,
        ...carts,
      }));
    }
    setLoading(false); // Loading complete
  }

  const selectCart = (cartId: string) => {
    setLoading(true);
    const cart: UserCart = userCarts[cartId];
    if (cart) {
      setSelectedCart(cartId);
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
        items: doc.data().items || [],
        users: doc.data().users || [],
      }
    }), {});
    return cartsList;
  };

  const loadCart = async (userId: string) => {
    console.log('Loading cart for user:', userId);
    const cartDoc = await getDoc(doc(db, 'carts', userId));
    let loadedItems: CartItem[] = [];
    let cartSharedWith: string[] = [];
    if (cartDoc.exists()) {
      loadedItems = cartDoc.data().items || [];
      cartSharedWith = cartDoc.data().users || [];
    }
    setUserCarts({[userId]: { id: userId, items: loadedItems, users: cartSharedWith }});
    setSelectedCart(userId);
  };

  const saveCart = async (id: string, items: CartItem[]) => {
    console.log('Saving cart for user:', id);
    await setDoc(doc(db, 'carts', id), { items }, { merge: true });
  };

  const addItem = (item: CartItem) => {
    if (selectedCart) {
      setUserCarts((prevCarts) => {
        const selectedCartItems = prevCarts[selectedCart].items
        const existingItemIndex = selectedCartItems.findIndex(cartItem => cartItem.id === item.id);
        if (existingItemIndex !== -1) {
          selectedCartItems[existingItemIndex].quantity += 1;
        } else {
          selectedCartItems.push(item);
        }
        return {
          ...prevCarts,
          [selectedCart]: {
            ...prevCarts[selectedCart],
            items: selectedCartItems,
          }
        }
      })
    }
    
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    if (selectedCart) {
      setUserCarts((prevCarts) => {
        return {
          ...prevCarts,
          [selectedCart]: {
            ...prevCarts[selectedCart],
            items: prevCarts[selectedCart].items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            )
          }
        }
      })
    }
  };

  const removeItem = (id: string) => {
    if (selectedCart) {
      setUserCarts((prevCarts) => {
        return {
          ...prevCarts,
          [selectedCart]: {
            ...prevCarts[selectedCart],
            items: prevCarts[selectedCart].items.filter((item) => item.id !== id)
          }
        }
      })
    }
  };

  const setCartUsers = (users: string[]) => {
    if (selectedCart) {
      setUserCarts((prevCarts) => {
        return {
          ...prevCarts,
          [selectedCart]: {
            ...prevCarts[selectedCart],
            users
          }
        }
      })
    }
  };

  const clearCart = () => {
    if (selectedCart) {
      setUserCarts((prevCarts) => {
        return {
          ...prevCarts,
          [selectedCart]: {
            ...prevCarts[selectedCart],
            items: []
          }
        }
      })
    }
  };

  const subtotal = selectedCart ? 
    userCarts[selectedCart].
      items
      .reduce((sum, item) => sum + item.price * item.quantity, 0) : 
    0;

  return (
    <CartContext.Provider value={{ 
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
