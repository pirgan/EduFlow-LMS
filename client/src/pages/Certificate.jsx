import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Certificate() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [enrolment, setEnrolment] = useState(null);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    api.get(`/enrolments/${courseId}/progress`).then((r) => setEnrolment(r.data));
    api.get(`/courses/${courseId}`).then((r) => setCourse(r.data));
  }, [courseId]);

  const handleDownload = () => window.print();

  if (!enrolment || !course) return <div className="flex justify-center py-20 text-gray-400">Loading…</div>;
  if (enrolment.progressPercent < 100) {
    return <div className="flex justify-center py-20 text-gray-400">Complete the course to unlock your certificate.</div>;
  }

  const completedDate = enrolment.completedAt
    ? new Date(enrolment.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8 print:bg-white print:p-0">
      {/* Print button — hidden when actually printing */}
      <button
        onClick={handleDownload}
        className="mb-6 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-indigo-700 print:hidden"
      >
        Download / Print
      </button>

      {/* Certificate */}
      <div className="w-full max-w-3xl bg-white border-8 border-double border-indigo-200 rounded-3xl p-12 shadow-2xl text-center">
        <p className="text-indigo-400 font-semibold uppercase tracking-widest text-sm mb-6">EduFlow Academy</p>
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Certificate of Completion</h1>
        <p className="text-gray-400 mb-10">This is to certify that</p>

        <p className="text-3xl font-bold text-indigo-600 mb-2 border-b-2 border-indigo-100 pb-4">
          {user?.name}
        </p>

        <p className="text-gray-400 mt-6 mb-2">has successfully completed</p>
        <p className="text-2xl font-bold text-gray-800 mb-8">{course.title}</p>

        <p className="text-sm text-gray-400">Completed on {completedDate}</p>

        <div className="mt-10 flex justify-center">
          <div className="w-24 h-1 bg-indigo-200 rounded-full" />
        </div>
        <p className="text-xs text-gray-300 mt-2">EduFlow Academy · AI-Powered Learning</p>
      </div>
    </div>
  );
}
