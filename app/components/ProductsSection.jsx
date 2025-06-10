"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

const PRODUCTS_API = "http://o-complex.com:1337/products";

export default function ProductsSection({ initialProducts, totalProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    initialProducts.length === 20 && initialProducts.length < totalProducts
  );

  const productsPerPage = 20;

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save products to localStorage for cart component
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("products", JSON.stringify(products));
    }
  }, [products]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        !loading &&
        hasMore
      ) {
        setCurrentPage((prev) => {
          const nextPage = prev + 1;
          loadProducts(nextPage);
          return nextPage;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const loadProducts = async (page) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${PRODUCTS_API}?page=${page}&page_size=${productsPerPage}`
      );

      if (response.ok) {
        const data = await response.json();

        // Filter out duplicate products by ID
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUniqueProducts = data.items.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...prev, ...newUniqueProducts];
        });

        setHasMore(
          data.items.length === productsPerPage &&
            products.length + data.items.length < data.total
        );
      }
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleQuantityChange = (productId, quantity) => {
    const newCart = { ...cart };
    if (quantity === 0) {
      delete newCart[productId];
    } else {
      newCart[productId] = quantity;
    }

    setCart(newCart);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(newCart));
    }

    // Dispatch event to update cart component
    window.dispatchEvent(
      new CustomEvent("cartUpdate", {
        detail: { cart: newCart, products },
      })
    );
  };

  return (
    <>
      {totalProducts > 0 && (
        <p className="text-gray-600 mb-6">
          Показано {products.length} из {totalProducts} товаров
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={`${product.id}-${index}`}
            product={product}
            quantity={cart[product.id] || 0}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          <p className="mt-2 text-gray-600">Загрузка товаров...</p>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">Все товары загружены</p>
        </div>
      )}
    </>
  );
}
