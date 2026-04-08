export default function ProgressBar({ percent = 0, className = '' }) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-xs text-[#888] mb-1.5">
        <span>Progress</span>
        <span className="font-semibold text-indigo-600">{clamped}%</span>
      </div>
      <div className="w-full bg-[#EEF0F2] rounded-full h-1.5">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
