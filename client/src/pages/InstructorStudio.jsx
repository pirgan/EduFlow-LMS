import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { toast } from 'react-toastify';

const STATUS_STYLES = {
  draft:     'bg-slate-100 text-slate-600',
  published: 'bg-green-100 text-green-700',
  archived:  'bg-red-100 text-red-600',
};

export default function InstructorStudio() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses/my').then((r) => setCourses(r.data));
  }, []);

  const archive = async (id) => {
    try {
      await api.patch(`/courses/${id}/archive`);
      setCourses((prev) => prev.map((c) => c._id === id ? { ...c, status: 'archived' } : c));
      toast.success('Course archived');
    } catch { toast.error('Archive failed'); }
  };

  const totalRevenue  = courses.reduce((s, c) => s + c.price * c.totalStudents, 0);
  const totalStudents = courses.reduce((s, c) => s + c.totalStudents, 0);
  const published     = courses.filter((c) => c.status === 'published').length;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Instructor Studio</h1>
            <p className="text-[#888] mt-1 text-sm">Manage your courses and track performance.</p>
          </div>
          <Link
            to="/studio/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            + Create New Course
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { value: courses.length, label: 'Total Courses' },
            { value: totalStudents,  label: 'Total Students' },
            { value: `$${totalRevenue.toFixed(0)}`, label: 'Total Revenue' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white border border-[#EEF0F2] rounded-xl p-5 shadow-sm">
              <p className="text-2xl font-bold text-indigo-600">{value}</p>
              <p className="text-xs text-[#888] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Courses table */}
        {courses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#EEF0F2] rounded-xl text-[#888]">
            No courses yet. Create your first one!
          </div>
        ) : (
          <div className="bg-white border border-[#EEF0F2] rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F8FA] border-b border-[#EEF0F2]">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#888] uppercase tracking-wide">Course</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#888] uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#888] uppercase tracking-wide">Students</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#888] uppercase tracking-wide">Revenue</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-[#888] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F2]">
                {courses.map((c) => (
                  <tr key={c._id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="px-5 py-4 max-w-xs">
                      <p className="font-semibold text-[#1A1A1A] truncate">{c.title}</p>
                      <p className="text-xs text-[#888] capitalize mt-0.5">{c.difficulty} · {c.category}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-[#666]">{c.totalStudents}</td>
                    <td className="px-5 py-4 text-right font-semibold text-[#1A1A1A]">
                      ${(c.price * c.totalStudents).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/studio/edit/${c._id}`}
                          className="text-xs font-semibold text-indigo-600 bg-[#EEF2FF] hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                        {c.status !== 'archived' && (
                          <button
                            onClick={() => archive(c._id)}
                            className="text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
