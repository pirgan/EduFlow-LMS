import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import CourseCard from '../components/CourseCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';

const CATEGORIES  = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Other'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const PAGE_LIMIT   = 12;

export default function CourseCatalogue() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [courses, setCourses]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [page, setPage]               = useState(1);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [filters, setFilters]         = useState({ category: '', difficulty: '', maxPrice: '' });

  const q = searchParams.get('q') || '';

  // Reset to page 1 whenever filters or search query change
  useEffect(() => { setPage(1); }, [q, filters]);

  useEffect(() => {
    const fetch = async () => {
      if (q) {
        const r = await api.get('/courses/search', { params: { q } });
        setCourses(r.data);
        setTotal(r.data.length);
        setTotalPages(1);
      } else {
        const params = { page, limit: PAGE_LIMIT };
        if (filters.category)   params.category   = filters.category;
        if (filters.difficulty) params.difficulty = filters.difficulty;
        const r = await api.get('/courses', { params });
        let result = r.data.courses;
        if (filters.maxPrice) result = result.filter((c) => c.price <= Number(filters.maxPrice));
        setCourses(result);
        setTotal(r.data.total);
        setTotalPages(r.data.pages || 1);
      }
    };
    fetch();
  }, [q, filters, page]);

  useEffect(() => {
    if (user) api.get('/enrolments').then((r) => setEnrolledIds(r.data.map((e) => e.course._id)));
  }, [user]);

  const handleEnrol = async (courseId) => {
    try {
      await api.post(`/enrolments/${courseId}`);
      setEnrolledIds((prev) => [...prev, courseId]);
      toast.success('Enrolled!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrolment failed');
    }
  };

  const changePage = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build page number array with ellipsis: [1, …, 4, 5, 6, …, 12]
  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, page]);
    if (page > 1) pages.add(page - 1);
    if (page < totalPages) pages.add(page + 1);
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) result.push('…');
      result.push(p);
      prev = p;
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">

        {/* Sidebar filters */}
        <aside className="w-56 flex-shrink-0">
          <div className="bg-white border border-[#EEF0F2] rounded-xl p-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-[#1A1A1A] mb-5 text-base">Filters</h2>

            {/* Category */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest mb-3">Category</p>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio" name="category" value={cat}
                      checked={filters.category === cat}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="accent-indigo-600 w-3.5 h-3.5"
                    />
                    <span className={`text-sm transition-colors ${filters.category === cat ? 'text-[#1A1A1A] font-medium' : 'text-[#666] group-hover:text-[#1A1A1A]'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
              {filters.category && (
                <button onClick={() => setFilters({ ...filters, category: '' })} className="text-xs text-indigo-600 mt-2 hover:underline">
                  Clear
                </button>
              )}
            </div>

            {/* Difficulty */}
            <div className="mb-5">
              <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest mb-3">Difficulty</p>
              <div className="flex flex-col gap-2">
                {DIFFICULTIES.map((d) => (
                  <label key={d} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio" name="difficulty" value={d}
                      checked={filters.difficulty === d}
                      onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                      className="accent-indigo-600 w-3.5 h-3.5"
                    />
                    <span className={`text-sm capitalize transition-colors ${filters.difficulty === d ? 'text-[#1A1A1A] font-medium' : 'text-[#666] group-hover:text-[#1A1A1A]'}`}>
                      {d}
                    </span>
                  </label>
                ))}
              </div>
              {filters.difficulty && (
                <button onClick={() => setFilters({ ...filters, difficulty: '' })} className="text-xs text-indigo-600 mt-2 hover:underline">
                  Clear
                </button>
              )}
            </div>

            {/* Max Price */}
            <div>
              <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest mb-3">Max Price ($)</p>
              <input
                type="number" min={0} placeholder="e.g. 50"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full bg-[#F7F8FA] border border-[#EEF0F2] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </aside>

        {/* Course grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">
                {q ? `Results for "${q}"` : 'All Courses'}
              </h1>
              <p className="text-sm text-[#888] mt-0.5">
                {total} course{total !== 1 ? 's' : ''} available
                {!q && totalPages > 1 && ` · page ${page} of ${totalPages}`}
              </p>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white border border-[#EEF0F2] rounded-xl p-16 text-center text-[#888]">
              No courses match your filters.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    enrolled={enrolledIds.includes(course._id)}
                    onEnrol={user ? handleEnrol : () => (window.location.href = '/login')}
                  />
                ))}
              </div>

              {/* Pagination */}
              {!q && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-10">
                  {/* Prev */}
                  <button
                    onClick={() => changePage(page - 1)}
                    disabled={page === 1}
                    className="h-9 px-3 rounded-lg border border-[#EEF0F2] bg-white text-sm text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>

                  {/* Page numbers */}
                  {pageNumbers().map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-[#888]">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => changePage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-indigo-600 text-white'
                            : 'border border-[#EEF0F2] bg-white text-[#64748B] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => changePage(page + 1)}
                    disabled={page === totalPages}
                    className="h-9 px-3 rounded-lg border border-[#EEF0F2] bg-white text-sm text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
