import ProgressBar from './ProgressBar.jsx';

export default function LessonSidebar({ lessons = [], completedLessons = [], currentLessonId, onSelect, progress = 0 }) {
  return (
    <aside className="w-80 bg-[#161616] border-l border-[#2A2A2A] flex flex-col h-full">
      {/* Header with progress */}
      <div className="p-5 bg-[#1A1A1A] border-b border-[#2A2A2A]">
        <h2 className="font-semibold text-white text-sm mb-3 leading-tight">Course Content</h2>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[#888]">{completedLessons.length} of {lessons.length} lessons</span>
          <span className="text-indigo-400 font-semibold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-[#2A2A2A] rounded-full h-1">
          <div
            className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>

      {/* Lesson list */}
      <ol className="flex-1 overflow-y-auto">
        {[...lessons]
          .sort((a, b) => a.order - b.order)
          .map((lesson) => {
            const isCompleted = completedLessons.includes(lesson._id);
            const isCurrent   = lesson._id === currentLessonId;
            return (
              <li key={lesson._id}>
                <button
                  onClick={() => onSelect?.(lesson)}
                  className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-colors border-b border-[#222] text-sm ${
                    isCurrent ? 'bg-indigo-600/10' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Status indicator */}
                  <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#2A2A2A] text-[#666]'
                  }`}>
                    {isCompleted ? '✓' : isCurrent ? '▶' : lesson.order}
                  </span>

                  <span className="flex-1 leading-snug">
                    <span className={isCurrent ? 'text-white font-semibold' : isCompleted ? 'text-[#666]' : 'text-[#999]'}>
                      {lesson.title}
                    </span>
                    {isCurrent && (
                      <span className="block text-xs text-indigo-400 mt-0.5">Playing now</span>
                    )}
                    {isCompleted && !isCurrent && (
                      <span className="block text-xs text-[#555] mt-0.5">Completed</span>
                    )}
                  </span>

                  <span className="text-xs text-[#555] flex-shrink-0 mt-0.5">{lesson.duration}m</span>
                </button>
              </li>
            );
          })}
      </ol>
    </aside>
  );
}
