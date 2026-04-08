import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import StarRating from '../components/StarRating.jsx';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    api.get(`/courses/${id}`).then((r) => setCourse(r.data));
    api.get(`/reviews/${id}`).then((r) => setReviews(r.data));
    if (user) {
      api.get('/enrolments').then((r) => {
        setEnrolled(r.data.some((e) => e.course._id === id));
      });
    }
  }, [id, user]);

  const handleEnrol = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post(`/enrolments/${id}`);
      setEnrolled(true);
      toast.success('Enrolled! Happy learning.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrolment failed');
    }
  };

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const { data } = await api.get(`/ai/summarise/${id}`);
      setSummary(data.summary);
    } catch { toast.error('Could not load AI summary'); }
    finally { setLoadingSummary(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/reviews/${id}`, { rating: myRating, comment });
      setReviews((prev) => [data, ...prev]);
      setMyRating(0); setComment('');
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    }
  };

  if (!course) return <div className="flex justify-center py-20 text-gray-400">Loading…</div>;

  const previewLessons = course.lessons.slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Banner */}
      <div className="rounded-2xl overflow-hidden mb-8 relative">
        <img
          src={course.thumbnail || 'https://placehold.co/900x350?text=EduFlow'}
          alt={course.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
          <div>
            <span className="text-xs bg-indigo-500 text-white rounded-full px-2 py-0.5 mb-2 inline-block">{course.category}</span>
            <h1 className="text-3xl font-bold text-white">{course.title}</h1>
            <p className="text-white/75 text-sm mt-1">by {course.instructor?.name}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <StarRating value={Math.round(course.rating?.average || 0)} readOnly />
            <span className="text-sm text-gray-500">({course.rating?.count || 0} reviews)</span>
            <span className="text-sm text-gray-400 capitalize">• {course.difficulty}</span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>

          {/* Free lesson preview */}
          <div className="mb-6">
            <h2 className="font-bold text-gray-700 mb-3">Lesson Preview (first 2 free)</h2>
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
              {previewLessons.map((l) => (
                <li key={l._id} className="px-4 py-3 text-sm text-gray-600 flex justify-between">
                  <span>{l.order}. {l.title}</span>
                  <span className="text-gray-400">{l.duration}m</span>
                </li>
              ))}
            </ul>
            {course.lessons.length > 2 && (
              <p className="text-xs text-gray-400 mt-2 pl-1">+ {course.lessons.length - 2} more lessons after enrolment</p>
            )}
          </div>

          {/* AI Summary */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-indigo-700 text-sm">🤖 AI Course Summary</h2>
              {!summary && (
                <button
                  onClick={fetchSummary}
                  disabled={loadingSummary}
                  className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                >
                  {loadingSummary ? 'Generating…' : 'Generate'}
                </button>
              )}
            </div>
            {summary ? (
              <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">Click "Generate" to get an AI-written summary.</p>
            )}
          </div>

          {/* Reviews */}
          <h2 className="font-bold text-gray-700 mb-3">Reviews</h2>
          {user && (
            <form onSubmit={submitReview} className="mb-6 bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
              <StarRating value={myRating} onChange={setMyRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience…"
                rows={3}
                required
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button type="submit" className="self-end bg-indigo-600 text-white text-sm rounded-lg px-4 py-2">
                Submit Review
              </button>
            </form>
          )}
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-gray-100 py-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-indigo-200 text-indigo-700 text-xs flex items-center justify-center font-bold">
                  {r.student?.name?.[0]}
                </div>
                <span className="font-semibold text-sm">{r.student?.name}</span>
                <StarRating value={r.rating} readOnly />
              </div>
              <p className="text-sm text-gray-600">{r.comment}</p>
              {r.instructorReply && (
                <div className="mt-2 pl-3 border-l-2 border-indigo-200 text-xs text-gray-500 italic">
                  Instructor: {r.instructorReply}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA card */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="sticky top-20 bg-white border border-gray-100 rounded-2xl shadow p-6 flex flex-col gap-4">
            <p className="text-3xl font-bold text-gray-900">${course.price?.toFixed(2)}</p>
            <p className="text-sm text-gray-400">{course.totalStudents} students enrolled</p>
            <button
              onClick={enrolled ? () => navigate(`/learn/${id}`) : handleEnrol}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {enrolled ? 'Continue Learning →' : 'Enrol Now'}
            </button>
            <ul className="text-xs text-gray-400 flex flex-col gap-1">
              <li>✓ {course.lessons?.length} lessons</li>
              <li>✓ AI-powered quiz & summary</li>
              <li>✓ Certificate of completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
