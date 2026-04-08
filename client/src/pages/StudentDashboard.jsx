import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import CertificateCard from '../components/CertificateCard.jsx';
import { toast } from 'react-toastify';

const THUMB_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-teal-500 to-cyan-600',
  'from-orange-500 to-red-500',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-500',
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrolments, setEnrolments] = useState([]);
  const [recommendations, setRecommendations] = useState('');
  const [loadingRec, setLoadingRec] = useState(false);

  useEffect(() => {
    api.get('/enrolments').then((r) => setEnrolments(r.data));
  }, []);

  const certificates = enrolments.filter((e) => e.progressPercent >= 100);
  const inProgress   = enrolments.filter((e) => e.progressPercent < 100);
  const totalLessons = enrolments.reduce((s, e) => s + (e.completedLessons?.length || 0), 0);

  const fetchRecommendations = async () => {
    setLoadingRec(true);
    try {
      const completedIds = certificates.map((e) => e.course._id);
      const { data } = await api.post('/ai/recommend', { interests: 'programming, design, data', completedIds });
      setRecommendations(data.recommendations);
    } catch { toast.error('Could not load recommendations'); }
    finally { setLoadingRec(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Continue Learning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-[#888] mt-1 text-sm">Pick up right where you left off.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { value: enrolments.length, label: 'Courses Enrolled' },
            { value: totalLessons,       label: 'Lessons Completed' },
            { value: certificates.length, label: 'Certificates Earned' },
            { value: `${Math.round(enrolments.reduce((s, e) => s + e.progressPercent, 0) / (enrolments.length || 1))}%`, label: 'Avg. Progress' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-xl border border-[#EEF0F2] p-5 shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">{value}</p>
              <p className="text-xs text-[#888] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* In Progress */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">In Progress</h2>
          {inProgress.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-[#EEF0F2]">
              <p className="text-[#888] mb-3">No courses in progress.</p>
              <Link to="/courses" className="text-indigo-600 hover:underline text-sm font-medium">Browse courses →</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {inProgress.map((e, i) => {
                const grad = THUMB_GRADIENTS[i % THUMB_GRADIENTS.length];
                return (
                  <div key={e._id} className="bg-white border border-[#EEF0F2] rounded-xl p-5 flex gap-5 items-center shadow-sm hover:shadow-md transition-shadow">
                    {e.course.thumbnail ? (
                      <img src={e.course.thumbnail} alt={e.course.title} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className={`w-16 h-12 rounded-lg bg-gradient-to-br ${grad} flex-shrink-0`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1A1A1A] truncate text-sm">{e.course.title}</p>
                      <p className="text-xs text-[#888] capitalize mb-2">{e.course.difficulty}</p>
                      <ProgressBar percent={e.progressPercent} />
                    </div>
                    <Link
                      to={`/learn/${e.course._id}`}
                      className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg px-4 py-2 font-semibold transition-colors"
                    >
                      Continue
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Certificates */}
        {certificates.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Completed Certificates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((e) => (
                <CertificateCard
                  key={e._id}
                  courseTitle={e.course.title}
                  studentName={user?.name}
                  completedAt={e.completedAt}
                  certificateUrl={e.certificateUrl}
                />
              ))}
            </div>
          </section>
        )}

        {/* AI Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A1A1A]">AI Recommended for You</h2>
            <button
              onClick={fetchRecommendations}
              disabled={loadingRec}
              className="text-sm font-medium text-indigo-600 hover:underline disabled:opacity-50"
            >
              {loadingRec ? 'Thinking…' : 'Refresh ✦'}
            </button>
          </div>
          {recommendations ? (
            <div className="bg-[#EEF2FF] border border-indigo-200 rounded-xl p-5 text-sm text-[#1A1A1A] whitespace-pre-wrap leading-relaxed">
              {recommendations}
            </div>
          ) : (
            <div className="bg-white border border-[#EEF0F2] rounded-xl p-10 text-center text-[#888] text-sm">
              Click "Refresh" to get AI-powered course recommendations based on your interests.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
