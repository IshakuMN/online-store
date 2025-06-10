import { StarIcon } from "@heroicons/react/solid";
import { format } from "date-fns";

function ReviewCard({ review }) {
  // Generate rating stars
  const renderStars = (rating) => {
    const stars = [];
    const maxRating = 5;

    for (let i = 1; i <= maxRating; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`h-5 w-5 ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          aria-hidden="true"
        />
      );
    }

    return stars;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        {/* Header with user info and rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {review.author
                ? review.author.substring(0, 1).toUpperCase()
                : "A"}
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">
                {review.author || "аноним"}
              </h3>
              <p className="text-xs text-gray-500">
                {review.date
                  ? format(new Date(review.date), "MMM d, yyyy")
                  : ""}
              </p>
            </div>
          </div>
          <div className="flex">
            {review.rating ? renderStars(review.rating) : null}
          </div>
        </div>

        {/* Review content */}
        <div
          className="prose prose-sm max-w-none text-gray-600"
          dangerouslySetInnerHTML={{
            __html: review.text.replace(
              /<script.*?>.*?<\/script>/gi,
              "[script removed]"
            ),
          }}
        />

        {/* Optional tags or metadata */}
        {review.tags && review.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {review.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewsSection({ initialReviews }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialReviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
