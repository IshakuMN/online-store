import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of a cart item
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// Define the shape of the context
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: number, newQuantity: number) => void;
  // You can add more functions like removeFromCart if needed
}

// Define the shape of a product (you'll get this from your API)
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      // Check if item already exists
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        // If it exists, just update quantity (this is an alternative to the UI logic)
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // If it doesn't exist, add it with quantity 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        // Remove item if quantity is 0 or less
        return prevItems.filter((item) => item.id !== productId);
      }
      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const value = { cartItems, addToCart, updateQuantity };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
