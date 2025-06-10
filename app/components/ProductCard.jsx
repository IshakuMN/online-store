"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";

export default function ProductCard({
  product,
  onQuantityChange,
  quantity = 0,
}) {
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const [showControls, setShowControls] = useState(quantity > 0);
  const [imageLoaded, setImageLoaded] = useState(false);

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

  return (
    <div className="group bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Image container with overlay */}
      <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-indigo-600 font-bold shadow-sm text-sm">
            {product.price.toLocaleString()}₽
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {product.description}
        </p>

        {/* Actions */}
        <div className="mt-auto pt-3">
          {!showControls ? (
            <button
              onClick={handleBuyClick}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-300 transform group-hover:translate-y-0 flex items-center justify-center"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              КУПИТЬ
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(localQuantity - 1)}
                className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors active:scale-95"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={localQuantity}
                onChange={handleInputChange}
                className="flex-1 text-center py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                min="0"
              />
              <button
                onClick={() => handleQuantityChange(localQuantity + 1)}
                className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors active:scale-95"
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
