import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import CourseCard from '../components/CourseCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const CATEGORIES = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science'];

export default function Home() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [category, setCategory] = useState('All');
  const [enrolledIds, setEnrolledIds] = useState([]);

  useEffect(() => {
    const params = category !== 'All' ? { category } : {};
    api.get('/courses', { params }).then((r) => setCourses(r.data.courses));
  }, [category]);

  useEffect(() => {
    if (user) {
      api.get('/enrolments').then((r) => setEnrolledIds(r.data.map((e) => e.course._id)));
    }
  }, [user]);

  const handleEnrol = async (courseId) => {
    try {
      await api.post(`/enrolments/${courseId}`);
      setEnrolledIds((prev) => [...prev, courseId]);
      toast.success('Enrolled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrolment failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            AI-Powered Learning Platform
          </div>
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight leading-tight text-white">
            Learn Without Limits
          </h1>
          <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
            Personalised learning paths, an AI tutor chatbot, quiz generator, and smart progress tracking — all in one place.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/courses"
              className="bg-white text-indigo-600 font-bold px-7 py-3 rounded-lg hover:bg-indigo-50 transition-colors shadow-lg text-sm"
            >
              Explore Courses
            </Link>
            {!user && (
              <Link
                to="/register"
                className="bg-white/15 text-white font-semibold px-7 py-3 rounded-lg hover:bg-white/25 transition-colors text-sm backdrop-blur-sm"
              >
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-white border-b border-[#EEF0F2]">
        <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '500+', label: 'Courses' },
            { value: '50K+', label: 'Students' },
            { value: '92%', label: 'Completion rate' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-indigo-600">{value}</p>
              <p className="text-sm text-[#888] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category tabs + course grid */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Featured Courses</h2>
          <Link to="/courses" className="text-sm text-indigo-600 hover:underline font-medium">
            View all →
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-[#666] border border-[#EEF0F2] hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#EEF0F2]">
            <p className="text-[#888]">No courses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                enrolled={enrolledIds.includes(course._id)}
                onEnrol={user ? handleEnrol : () => (window.location.href = '/login')}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
