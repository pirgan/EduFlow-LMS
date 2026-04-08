import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios.js';
import { toast } from 'react-toastify';
import VideoPlayer from '../components/VideoPlayer.jsx';
import LessonSidebar from '../components/LessonSidebar.jsx';

export default function LessonPlayer() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrolment, setEnrolment] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loadingExplain, setLoadingExplain] = useState(false);

  useEffect(() => {
    api.get(`/courses/${courseId}`).then((r) => {
      setCourse(r.data);
      setCurrentLesson(r.data.lessons.sort((a, b) => a.order - b.order)[0]);
    });
    api.get(`/enrolments/${courseId}/progress`).then((r) => setEnrolment(r.data));
  }, [courseId]);

  const markComplete = async () => {
    try {
      const { data } = await api.patch(`/enrolments/${courseId}/lessons/${currentLesson._id}/complete`);
      setEnrolment(data);
      toast.success('Lesson marked complete!');
      const sorted = [...course.lessons].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((l) => l._id === currentLesson._id);
      if (idx < sorted.length - 1) setCurrentLesson(sorted[idx + 1]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save progress');
    }
  };

  const explainConcept = async () => {
    if (!concept.trim()) return;
    setLoadingExplain(true);
    setExplanation('');
    try {
      const { data } = await api.post('/ai/explain', {
        concept,
        context: `${course?.title} — ${currentLesson?.title}`,
      });
      setExplanation(data.explanation);
    } catch { toast.error('Explain failed'); }
    finally { setLoadingExplain(false); }
  };

  if (!course || !currentLesson) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-68px)] bg-[#111] text-[#888] text-sm">
        Loading…
      </div>
    );
  }

  const completed = enrolment?.completedLessons || [];
  const isCurrentDone = completed.includes(currentLesson._id);

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden bg-[#111111]">

      {/* Video column */}
      <div className="flex-1 flex flex-col overflow-y-auto">

        {/* Video */}
        <div className="bg-black">
          <VideoPlayer url={currentLesson.videoUrl} onEnded={markComplete} />
        </div>

        {/* Lesson info */}
        <div className="p-6 bg-[#161616] border-t border-[#2A2A2A]">
          <h1 className="text-xl font-bold text-white mb-1">{currentLesson.title}</h1>
          <p className="text-sm text-[#888] mb-5">{course.title} · {currentLesson.duration}m</p>

          <button
            onClick={markComplete}
            disabled={isCurrentDone}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              isCurrentDone
                ? 'bg-green-900/40 text-green-400 cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isCurrentDone ? '✓ Completed' : '✓  Mark as Complete'}
          </button>
        </div>

        {/* AI Explain Concept */}
        <div className="mx-6 mb-6 mt-4 bg-[#161616] border border-indigo-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <h2 className="text-sm font-bold text-white">AI Explain Concept</h2>
          </div>
          {explanation && (
            <p className="text-sm text-[#AAA] leading-relaxed mb-4">{explanation}</p>
          )}
          <div className="flex gap-2">
            <input
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder={`Ask about "${currentLesson.title}"…`}
              className="flex-1 bg-[#222] text-white text-sm rounded-lg px-4 py-2.5 placeholder-[#555] border border-[#333] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && explainConcept()}
            />
            <button
              onClick={explainConcept}
              disabled={loadingExplain}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg px-5 font-semibold disabled:opacity-50 transition-colors"
            >
              {loadingExplain ? '…' : 'Ask'}
            </button>
          </div>
        </div>
      </div>

      {/* Lesson sidebar */}
      <LessonSidebar
        lessons={course.lessons}
        completedLessons={completed}
        currentLessonId={currentLesson._id}
        onSelect={setCurrentLesson}
        progress={enrolment?.progressPercent || 0}
      />
    </div>
  );
}
