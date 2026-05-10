import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { logAction } from "../services/logger";

export default function CartModal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalPrice
  } = useCart();

  const [purchasedItems, setPurchasedItems] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  if (!isCartOpen) return null;

  const resetCheckoutInfo = () => {
    setPurchasedItems([]);
    setCheckoutMessage("");
    setCheckoutError("");
  };

  const closeCart = () => {
    logAction("CART_CLOSED", "User closed cart modal");
    resetCheckoutInfo();
    setIsCartOpen(false);
  };

  const continueShopping = () => {
    logAction("CONTINUE_SHOPPING_CLICKED", "User clicked Continue shopping after purchase/cart view");
    resetCheckoutInfo();
    clearCart();
    setIsCartOpen(false);
  };

  const checkout = async () => {
    setCheckoutMessage("");
    setCheckoutError("");
    setPurchasedItems([]);

    const token = localStorage.getItem("token");

    if (!user || !token) {
      logAction("CHECKOUT_ATTEMPT_WITHOUT_LOGIN", "Anonymous user tried to checkout");
      setIsCartOpen(false);
      navigate("/login");
      return;
    }

    const request = {
      items: cartItems.map((item) => ({
        gameId: item.id,
        quantity: item.quantity
      }))
    };

    logAction(
      "CHECKOUT_STARTED",
      `User started checkout. Items: ${cartItems.map((i) => `${i.title} x${i.quantity}`).join(", ")}. Total: €${totalPrice.toFixed(2)}`
    );

    const res = await fetch("https://localhost:7253/api/orders/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });

    if (!res.ok) {
      const text = await res.text();
      setCheckoutError(text || "Checkout error.");

      logAction(
        "CHECKOUT_FAILED",
        text || "Checkout failed with unknown error"
      );

      return;
    }

    const data = await res.json();

    setCheckoutMessage(data.message || "Payment successful.");
    setPurchasedItems(data.items || []);

    logAction(
      "CHECKOUT_COMPLETED",
      `Order completed. OrderId=${data.orderId}, Total=€${Number(data.totalPrice).toFixed(2)}, Items=${(data.items || []).map((i) => `${i.title}: ${i.keyCode}`).join(", ")}`
    );

    clearCart();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-start pt-10">
      <div className="bg-white text-black w-[90%] max-w-4xl rounded-xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">Cart</h2>

          <button onClick={closeCart} className="text-3xl text-gray-600 hover:text-black">
            ×
          </button>
        </div>

        <div className="p-6 max-h-[500px] overflow-y-auto">
          {checkoutMessage && purchasedItems.length > 0 && (
            <div className="mb-5 border border-green-500 bg-green-50 rounded-xl p-4">
              <h3 className="text-xl font-bold text-green-700 mb-3">
                {checkoutMessage}
              </h3>

              <p className="text-gray-700 mb-4">Your purchased keys:</p>

              <div className="space-y-3">
                {purchasedItems.map((item, index) => (
                  <div key={`${item.gameId}-${index}`} className="border rounded-xl p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img src={`/lootkey-app${item.imageUrl}`} alt={item.title} className="w-24 h-14 object-cover rounded" />

                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-gray-500">
                          €{Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-100 px-3 py-2 rounded font-mono text-sm">
                      {item.keyCode}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {checkoutError && (
            <div className="mb-5 border border-red-500 bg-red-50 text-red-700 rounded-xl p-4">
              {checkoutError}
            </div>
          )}

          {cartItems.length === 0 && purchasedItems.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              Your cart is empty.
            </p>
          ) : (
            cartItems.length > 0 && (
              <div className="space-y-5">
                {cartItems.map((item) => (
                  <div key={item.id} className="border rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={`/lootkey-app${item.imageUrl}`} alt={item.title} className="w-24 h-16 object-cover rounded" />

                      <div>
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-gray-500">LootKey Store</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => decreaseQuantity(item.id)} className="text-2xl px-3 text-gray-500 hover:text-black">
                        −
                      </button>

                      <div className="border px-4 py-2 rounded">{item.quantity}</div>

                      <button onClick={() => increaseQuantity(item.id)} className="text-2xl px-3 text-blue-600 hover:text-blue-800">
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>

                      <button onClick={() => removeFromCart(item.id)} className="text-sm text-red-500 hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <button onClick={closeCart} className="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg text-blue-600">
              Continue shopping
            </button>

            <div className="flex items-center gap-5 bg-green-50 border border-green-500 rounded-lg px-6 py-4">
              <p className="text-3xl font-semibold">€{totalPrice.toFixed(2)}</p>

              <button onClick={checkout} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold">
                Checkout
              </button>
            </div>
          </div>
        )}

        {purchasedItems.length > 0 && cartItems.length === 0 && (
          <div className="p-6 border-t flex justify-between items-center">
            <button onClick={continueShopping} className="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg text-blue-600">
              Continue shopping
            </button>

            <button
              onClick={() => {
                logAction("PROFILE_OPENED_AFTER_PURCHASE", "User opened profile page after purchase");
                resetCheckoutInfo();
                setIsCartOpen(false);
                navigate("/profile");
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Go to profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}