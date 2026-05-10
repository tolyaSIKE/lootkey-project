import { createContext, useContext, useEffect, useState } from "react";
import { logAction } from "../services/logger";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("lootkey_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("lootkey_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (game) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === game.id);
      const finalPrice = game.discountPrice ?? game.price;

      if (existing) {
        logAction(
          "CART_ITEM_QUANTITY_INCREASED",
          `Increased quantity in cart: ${game.title}, gameId=${game.id}`
        );

        return prev.map((item) =>
          item.id === game.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      logAction(
        "CART_ITEM_ADDED",
        `Added to cart: ${game.title}, gameId=${game.id}, price=${finalPrice}`
      );

      return [
        ...prev,
        {
          id: game.id,
          title: game.title,
          price: Number(finalPrice),
          originalPrice: Number(game.price),
          discountPrice: game.discountPrice,
          imageUrl: game.imageUrl,
          quantity: 1
        }
      ];
    });

    setIsCartOpen(true);
  };

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          logAction(
            "CART_ITEM_QUANTITY_INCREASED",
            `Increased quantity: ${item.title}, gameId=${item.id}`
          );

          return { ...item, quantity: item.quantity + 1 };
        }

        return item;
      })
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            logAction(
              "CART_ITEM_QUANTITY_DECREASED",
              `Decreased quantity: ${item.title}, gameId=${item.id}`
            );

            return { ...item, quantity: item.quantity - 1 };
          }

          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const removed = prev.find((item) => item.id === id);

      if (removed) {
        logAction(
          "CART_ITEM_REMOVED",
          `Removed from cart: ${removed.title}, gameId=${removed.id}`
        );
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  const clearCart = () => {
    if (cartItems.length > 0) {
      logAction(
        "CART_CLEARED",
        `Cart cleared. Items count: ${cartItems.length}`
      );
    }

    setCartItems([]);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
        totalCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);