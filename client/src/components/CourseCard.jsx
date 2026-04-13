import { Link } from 'react-router-dom';
import StarRating from './StarRating.jsx';

const DIFFICULTY_COLOURS = {
  beginner:     'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced:     'bg-red-100 text-red-600',
};


export default function CourseCard({ course, enrolled = false, onEnrol }) {
  const { _id, title, thumbnail, category, difficulty, instructor, rating, price } = course;
  const imgSrc = thumbnail || `https://picsum.photos/seed/${_id}/400/220`;

  return (
    <div className="bg-white rounded-xl border border-[#EEF0F2] shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">

      {/* Thumbnail */}
      <Link to={`/courses/${_id}`} className="relative block">
        <img src={imgSrc} alt={title} className="w-full h-44 object-cover" />
        <span className="absolute top-3 left-3 text-xs font-semibold bg-indigo-600 text-white rounded-full px-2.5 py-1">
          {category}
        </span>
        <span className={`absolute top-3 right-3 text-xs font-semibold rounded-full px-2.5 py-1 ${DIFFICULTY_COLOURS[difficulty] || 'bg-gray-100 text-gray-600'}`}>
          {difficulty}
        </span>
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Title */}
        <Link
          to={`/courses/${_id}`}
          className="font-semibold text-[#1A1A1A] hover:text-indigo-600 line-clamp-2 leading-snug text-[15px] transition-colors"
        >
          {title}
        </Link>

        {/* Instructor */}
        <p className="text-xs text-[#888]">{instructor?.name || 'Unknown Instructor'}</p>

        {/* Rating — numeric average + stars + count */}
        <div className="flex items-center gap-1.5">
          {rating?.average > 0 && (
            <span className="text-sm font-bold text-amber-500">{rating.average.toFixed(1)}</span>
          )}
          <StarRating value={Math.round(rating?.average || 0)} readOnly />
          <span className="text-xs text-[#888]">({rating?.count || 0})</span>
        </div>

        {/* Price / enrol */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#EEF0F2]">
          {enrolled ? (
            <span className="text-sm font-semibold text-green-600 bg-green-50 rounded-full px-3 py-1">
              ✓ Enrolled
            </span>
          ) : (
            <>
              <span className="font-bold text-[#1A1A1A] text-base">${price?.toFixed(2)}</span>
              <button
                onClick={() => onEnrol?.(_id)}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-1.5 font-semibold transition-colors"
              >
                Enrol Now
              </button>
            </>
          )}
          {enrolled && (
            <Link
              to={`/learn/${_id}`}
              className="text-sm border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-lg px-4 py-1.5 font-semibold transition-colors"
            >
              Continue
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
