"use client";

import { useState, useEffect } from "react";
import { Phone, ShoppingBag, X, ChevronRight, Loader2 } from "lucide-react";

const ORDER_API = "http://o-complex.com:1337/order";

export default function CartSection() {
  const [cart, setCart] = useState({});
  const [phone, setPhone] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [products, setProducts] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      const savedPhone = localStorage.getItem("phone");
      const savedProducts = localStorage.getItem("products");

      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedPhone) setPhone(savedPhone);
      if (savedProducts) setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Save phone to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("phone", phone);
    }
  }, [phone]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = (event) => {
      setCart(event.detail.cart);
      setProducts(event.detail.products);
    };

    window.addEventListener("cartUpdate", handleCartUpdate);
    return () => window.removeEventListener("cartUpdate", handleCartUpdate);
  }, []);

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [productId, qty]) => {
      const product = products.find((p) => p.id === parseInt(productId));
      return sum + (product?.price || 0) * qty;
    }, 0);
  };

  const removeItem = (productId) => {
    const newCart = { ...cart };
    delete newCart[productId];
    setCart(newCart);

    // Dispatch event to update other components
    window.dispatchEvent(
      new CustomEvent("cartUpdate", {
        detail: { cart: newCart, products },
      })
    );
  };

  const handleOrder = async () => {
    if (Object.keys(cart).length === 0 || !phone.trim()) return;

    try {
      setOrderLoading(true);
      setOrderStatus(null);

      const cartArray = Object.entries(cart).map(([id, quantity]) => ({
        id: parseInt(id),
        quantity,
      }));

      const orderData = {
        phone: phone.replace(/\D/g, ""),
        cart: cartArray,
      };

      const response = await fetch(ORDER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success === 1) {
        setOrderStatus({ success: true, message: "Заказ успешно оформлен!" });
        setCart({});
        setPhone("");
        localStorage.removeItem("cart");
        localStorage.removeItem("phone");
        // Dispatch event to update other components
        window.dispatchEvent(
          new CustomEvent("cartUpdate", {
            detail: { cart: {}, products },
          })
        );
      } else {
        setOrderStatus({
          success: false,
          message: result.error || "Ошибка при оформлении заказа",
        });
      }
    } catch (error) {
      console.error("Order failed:", error);
      setOrderStatus({
        success: false,
        message: "Ошибка соединения с сервером",
      });
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5 text-indigo-600" />
            Корзина
            {getTotalItems() > 0 && (
              <span className="ml-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {getTotalItems()}
              </span>
            )}
          </h3>
        </div>

        {Object.keys(cart).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-1">Корзина пуста</p>
            <p className="text-sm text-gray-400">
              Добавьте товары, чтобы оформить заказ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(cart).map(([productId, qty]) => {
              const product = products.find(
                (p) => p.id === parseInt(productId)
              );
              return (
                <div
                  key={productId}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mr-3">
                      {product?.title?.charAt(0) || "Т"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {product?.title || "Товар"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product?.price?.toLocaleString()}₽ × {qty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-3">
                      {((product?.price || 0) * qty).toLocaleString()}₽
                    </span>
                    <button
                      onClick={() => removeItem(productId)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Товаров:</span>
                <span>{getTotalItems()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900">
                <span>Итого:</span>
                <span>{getTotalPrice().toLocaleString()}₽</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {orderStatus && (
        <div
          className={`mb-5 p-4 rounded-xl flex items-center ${
            orderStatus.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div
            className={`mr-3 p-2 rounded-full ${
              orderStatus.success ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {orderStatus.success ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <span className="font-medium">{orderStatus.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Phone size={18} className="text-gray-500" />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (___) ___-__-__"
            className="w-full py-3 pl-10 pr-3 border border-gray-300 text-gray-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
          />
        </div>
        <button
          disabled={
            Object.keys(cart).length === 0 || !phone.trim() || orderLoading
          }
          onClick={handleOrder}
          className="bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
        >
          {orderLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <>
              Оформить заказ
              <ChevronRight className="ml-1 h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
