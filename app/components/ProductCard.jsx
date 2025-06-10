"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Heart } from "lucide-react";

export default function ProductCard({
  product,
  onQuantityChange,
  quantity = 0,
}) {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const [showControls, setShowControls] = useState(quantity > 0);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Get first word of product title for fallback
  const firstWord = product.title.split(" ")[0];

  // Generate a consistent background color based on product id
  const colorIndex = product.id % 6;
  const bgColors = [
    "bg-rose-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-purple-500",
    "bg-indigo-500",
  ];
  const bgColor = bgColors[colorIndex];

  const handleBuyClick = () => {
    setShowControls(true);
    setLocalQuantity(1);
    onQuantityChange(product.id, 1);
  };

  const handleQuantityChange = (newQuantity) => {
    const qty = Math.max(0, newQuantity);
    setLocalQuantity(qty);
    onQuantityChange(product.id, qty);
    if (qty === 0) {
      setShowControls(false);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    handleQuantityChange(value);
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full border border-gray-200">
      {/* Image container with text fallback */}
      <div className="relative aspect-square overflow-hidden">
        {!imageError ? (
          <img
            src={product.image_url}
            alt={product.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full ${bgColor} flex items-center justify-center text-white text-2xl font-bold p-4 text-center`}
          >
            {firstWord}
          </div>
        )}

        {/* Price tag */}
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm text-gray-900 font-bold px-3 py-1 rounded-full shadow-md">
            {product.price.toLocaleString()}₽
          </div>
        </div>

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            size={20}
            className={`${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            } transition-colors`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-5">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-gray-900 transition-colors">
          {product.title}
        </h3>

        <p className="text-gray-600 text-sm mb-5 line-clamp-3 flex-grow">
          {product.description}
        </p>

        {/* Action buttons */}
        <div className="mt-auto">
          {!showControls ? (
            <button
              onClick={handleBuyClick}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 active:bg-gray-900 transition-all shadow-sm flex items-center justify-center"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              КУПИТЬ
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(localQuantity - 1)}
                className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={localQuantity}
                onChange={handleInputChange}
                className="flex-1 text-center py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-all"
                min="0"
              />
              <button
                onClick={() => handleQuantityChange(localQuantity + 1)}
                className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
