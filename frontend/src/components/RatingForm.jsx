import { useState } from 'react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

/**
 * RatingForm - Form component for submitting applicant ratings
 * Handles validation and user feedback
 * Uses controlled components for form state management
 */
function RatingForm({ onSubmit, isSubmitting }) {
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reviewerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!rating) {
      setError('Please select a rating');
      return;
    }

    setError('');
    const success = await onSubmit({
      reviewer_name: reviewerName,
      rating,
      comment: comment.trim() || undefined
    });

    if (success) {
      // clear form on success
      setReviewerName('');
      setRating(0);
      setComment('');
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e5e5',
      marginBottom: '24px',
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#0a0a0a',
      }}>
        Add Your Rating
      </h3>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          borderRadius: '8px',
          color: '#dc3545',
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          color: '#737373',
          marginBottom: '6px',
        }}>
          Your Name *
        </label>
        <input
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="Enter your name"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          color: '#737373',
          marginBottom: '6px',
        }}>
          Rating *
        </label>
        <StarRating
          rating={rating}
          onRatingChange={setRating}
          readonly={isSubmitting}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          color: '#737373',
          marginBottom: '6px',
        }}>
          Comment (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your feedback..."
          rows={3}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{
          padding: '10px 20px',
          backgroundColor: isSubmitting ? '#9DC3C2' : '#4D7298',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          fontWeight: '500',
          fontSize: '14px',
          transition: 'all 0.2s ease',
          opacity: isSubmitting ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = '#77A6B6';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSubmitting) {
            e.currentTarget.style.backgroundColor = '#4D7298';
          }
        }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
}

RatingForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool
};

export default RatingForm;
