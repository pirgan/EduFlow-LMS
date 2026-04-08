import { useState } from 'react';

// Interactive 1-5 star rating input.
// Props:
//   value      — controlled rating value (number)
//   onChange   — called with new rating when a star is clicked
//   readOnly   — renders static filled stars when true (no hover/click)
export default function StarRating({ value = 0, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`text-2xl leading-none transition-colors ${
            star <= active ? 'text-yellow-400' : 'text-gray-300'
          } ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
