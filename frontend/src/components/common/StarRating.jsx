import { FiStar } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';

const StarRating = ({ rating = 0, numReviews = 0, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= Math.round(rating) ? (
              <AiFillStar className={`${sizeClass} star-filled`} />
            ) : (
              <FiStar className={`${sizeClass} star-empty`} />
            )}
          </span>
        ))}
      </div>
      {numReviews > 0 && (
        <span className="text-xs text-gray-500">({numReviews})</span>
      )}
    </div>
  );
};
export default StarRating;
