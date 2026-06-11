import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
}

export default function StarRating({ rating, size = 14, showValue = false, reviewCount }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= Math.round(rating);
          return (
            <Star
              key={star}
              size={size}
              className={filled ? 'text-tech-rating fill-tech-rating' : 'text-tech-text-muted'}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-tech-text-muted text-xs ml-1">
          {rating} {reviewCount !== undefined && `(${reviewCount})`}
        </span>
      )}
    </div>
  );
}
