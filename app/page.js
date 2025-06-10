import { Suspense } from "react";
import ProductsSection from "./components/ProductsSection";
import ReviewsSection from "./components/ReviewsSection";
import CartSection from "./components/CartSection.jsx";

// API URLs
const API_BASE = "http://o-complex.com:1337";
const REVIEWS_API = `${API_BASE}/reviews`;
const PRODUCTS_API = `${API_BASE}/products`;

// Fetch initial data on server
async function getInitialData() {
  try {
    const [reviewsRes, productsRes] = await Promise.all([
      fetch(REVIEWS_API, {
        next: { revalidate: 300 },
      }), // Cache for 5 minutes
      fetch(`${PRODUCTS_API}?page=1&page_size=20`, {
        next: { revalidate: 60 },
      }), // Cache for 1 minute
    ]);

    const reviews = reviewsRes.ok ? await reviewsRes.json() : [];
    const products = productsRes.ok
      ? await productsRes.json()
      : { items: [], total: 0 };

    return { reviews, products };
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return { reviews: [], products: { items: [], total: 0 } };
  }
}

// Main Server Component
export default async function EcommercePage() {
  const { reviews, products } = await getInitialData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Static Header - Server Rendered */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">Интернет-магазин</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Reviews Section - Server Rendered with fallback */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Отзывы</h2>
          <Suspense fallback={<ReviewsLoading />}>
            <ReviewsSection initialReviews={reviews} />
          </Suspense>
        </section>

        {/* Cart Section - Client Component */}
        <section className="mb-8">
          <CartSection />
        </section>

        {/* Products Section - Hybrid (Server + Client) */}
        <section>
          <h2 className="text-2xl font-bold mb-2">Товары</h2>
          <Suspense fallback={<ProductsLoading />}>
            <ProductsSection
              initialProducts={products.items}
              totalProducts={products.total}
            />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

// Loading Components
function ReviewsLoading() {
  return (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      <p className="mt-2 text-gray-600">Загрузка отзывов...</p>
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      <p className="mt-2 text-gray-600">Загрузка товаров...</p>
    </div>
  );
}
