import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 Star - Poor',
  2: '2 Stars - Fair',
  3: '3 Stars - Good',
  4: '4 Stars - Very Good',
  5: '5 Stars - Excellent',
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const activeValue = hoverValue !== null ? hoverValue : (value || 0);

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" role={readOnly ? 'img' : 'radiogroup'} aria-label={`Rating: ${value || 0} of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              id={`star-btn-${star}`}
              onClick={() => {
                if (!readOnly && onChange) {
                  onChange(star);
                }
              }}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-115 transition-transform'} p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-amber-400`}
              aria-label={`${star} star`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                    : 'text-white/20 fill-white/5'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showLabel && activeValue > 0 && (
        <span className="text-xs font-bold text-white/70 ml-1.5 uppercase tracking-wider">
          {RATING_LABELS[activeValue]}
        </span>
      )}
    </div>
  );
};
