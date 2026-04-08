import { useEffect, useState } from 'react';
import api from '../api/axios.js';

const ROLE_COLOURS = {
  student:    'bg-blue-100 text-blue-700',
  instructor: 'bg-purple-100 text-purple-700',
  admin:      'bg-red-100 text-red-600',
};
const STATUS_COLOURS = {
  draft:     'bg-gray-100 text-gray-600',
  published: 'bg-green-100 text-green-700',
  archived:  'bg-red-100 text-red-500',
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    // Admin views all courses via /my with admin role — server returns all courses
    api.get('/courses/my').then((r) => setCourses(r.data));
    // Note: a /api/admin/users route would be needed for full user management;
    // this panel currently shows courses and basic platform stats only.
  }, []);

  const totalStudents  = courses.reduce((s, c) => s + c.totalStudents, 0);
  const totalRevenue   = courses.reduce((s, c) => s + c.price * c.totalStudents, 0);
  const publishedCount = courses.filter((c) => c.status === 'published').length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Courses',    value: courses.length },
          { label: 'Published',        value: publishedCount },
          { label: 'Total Enrolments', value: totalStudents },
          { label: 'Revenue',          value: `$${totalRevenue.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {['users', 'courses'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-white shadow text-indigo-600' : 'text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'courses' && (
        <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left">Title</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Students</th>
                <th className="px-5 py-3 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.map((c) => (
                <tr key={c._id} className="bg-white hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-800 max-w-xs truncate">{c.title}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOURS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-gray-600">{c.totalStudents}</td>
                  <td className="px-5 py-4 text-right font-semibold text-gray-700">
                    ${(c.price * c.totalStudents).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400 text-sm">
          User management requires a dedicated <code className="bg-gray-100 px-1 rounded">/api/admin/users</code> endpoint.
          Add it to the server and wire it here.
        </div>
      )}
    </div>
  );
}
