/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from "react";
import { logAction } from "../services/logger";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("lootkey_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState("");

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
          "/cart",
          `Increased quantity in cart: ${game.title}, gameId=${game.id}`,
        );

        return prev.map((item) =>
          item.id === game.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      logAction(
        "CART_ITEM_ADDED",
        "/cart",
        `Added to cart: ${game.title}, gameId=${game.id}, price=${finalPrice}`,
      );

      return [
        ...prev,
        {
          ...game,
          price: finalPrice,
          quantity: 1,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const increaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const removed = prev.find((item) => item.id === id);

      if (removed) {
        logAction(
          "CART_ITEM_REMOVED",
          "/cart",
          `Removed from cart: ${removed.title}, gameId=${removed.id}`,
        );
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  const clearCart = () => {
    if (cartItems.length > 0) {
      logAction(
        "CART_CLEARED",
        "/cart",
        `Cart cleared. Items count: ${cartItems.length}`,
      );
    }

    setCartItems([]);
  };

  const checkout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCheckoutMessage("You need to login before checkout.");
      return;
    }

    if (cartItems.length === 0) {
      setCheckoutMessage("Cart is empty.");
      return;
    }

    const dto = {
      items: cartItems.map((item) => ({
        gameId: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch("https://localhost:7253/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      const data = await res.json();

      if (!res.ok) {
        setCheckoutMessage(data.message || "Checkout error.");
        return;
      }

      setPurchasedItems(data.items || []);
      setCheckoutMessage(data.message || "Payment successful.");
      clearCart();

      logAction(
        "CHECKOUT_SUCCESS",
        "/cart",
        `Checkout completed. OrderId=${data.orderId}, total=${data.totalPrice}`,
      );
    } catch (err) {
      console.error("Checkout error:", err);
      setCheckoutMessage("Checkout request failed.");
    }
  };

  const resetCheckoutInfo = () => {
    setPurchasedItems([]);
    setCheckoutMessage("");
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        purchasedItems,
        checkoutMessage,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        checkout,
        resetCheckoutInfo,
        totalPrice,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
