import { useState } from 'react';
import PropTypes from 'prop-types';

// Constants for consistent sizing across app
const STAR_SIZES = {
  large: '32px',
  small: '16px'
};

const STAR_GAPS = {
  large: '8px',
  small: '2px'
};

/**
 * StarRating - Interactive star rating component
 * Displays 1-5 stars with hover effects
 * Can be used readonly for display or interactive for input
 */
function StarRating({ rating, onRatingChange, size = 'large', readonly = false }) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const starSize = STAR_SIZES[size];

  return (
    <div style={{ display: 'flex', gap: STAR_GAPS[size] }}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hoveredStar || rating);

        return (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange && onRatingChange(star)}
            onMouseEnter={() => !readonly && setHoveredStar(star)}
            onMouseLeave={() => !readonly && setHoveredStar(0)}
            disabled={readonly}
            style={{
              background: 'none',
              border: 'none',
              cursor: readonly ? 'default' : 'pointer',
              fontSize: starSize,
              padding: '4px',
              transition: 'transform 0.2s',
            }}
            onMouseDown={(e) => {
              if (!readonly) {
                e.currentTarget.style.transform = 'scale(0.9)';
              }
            }}
            onMouseUp={(e) => {
              if (!readonly) {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            {filled ? '⭐' : '☆'}
          </button>
        );
      })}
    </div>
  );
}

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onRatingChange: PropTypes.func,
  size: PropTypes.oneOf(['large', 'small']),
  readonly: PropTypes.bool
};

export default StarRating;
