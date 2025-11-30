import PropTypes from 'prop-types';
import StarRating from './StarRating';

/**
 * RatingsList - Displays all ratings for an applicant
 * Shows average rating prominently and lists individual reviews
 * Returns null if no ratings exist (null object pattern)
 */
function RatingsList({ ratings, average }) {
  if (!ratings || ratings.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Average rating badge */}
      {average && average.count > 0 && (
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#F5FCEE',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#4D7298',
          }}>
            {average.average}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', color: '#737373', marginBottom: '4px' }}>
              Average Rating
            </div>
            <div style={{ fontSize: '12px', color: '#a3a3a3' }}>
              {average.count} {average.count === 1 ? 'review' : 'reviews'}
            </div>
          </div>
        </div>
      )}

      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#0a0a0a',
      }}>
        Reviews ({ratings.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ratings.map(rating => (
          <div
            key={rating.id}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e5e5',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '8px',
            }}>
              <div>
                <div style={{
                  fontWeight: '600',
                  color: '#0a0a0a',
                  fontSize: '14px',
                }}>
                  {rating.reviewer_name}
                </div>
                {rating.reviewer_email && (
                  <div style={{
                    fontSize: '12px',
                    color: '#a3a3a3',
                    marginTop: '2px',
                  }}>
                    {rating.reviewer_email}
                  </div>
                )}
              </div>
              <StarRating rating={rating.rating} readonly size="small" />
            </div>

            {rating.comment && (
              <div style={{
                fontSize: '14px',
                color: '#0a0a0a',
                lineHeight: '1.5',
                marginTop: '8px',
              }}>
                {rating.comment}
              </div>
            )}

            <div style={{
              fontSize: '11px',
              color: '#a3a3a3',
              marginTop: '8px',
            }}>
              {new Date(rating.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

RatingsList.propTypes = {
  ratings: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    reviewer_name: PropTypes.string.isRequired,
    reviewer_email: PropTypes.string,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string,
    created_at: PropTypes.string.isRequired
  })),
  average: PropTypes.shape({
    average: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired
  })
};

export default RatingsList;
