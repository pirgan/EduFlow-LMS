export default function CertificateCard({ courseTitle, studentName, completedAt, certificateUrl }) {
  const date = completedAt ? new Date(completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl text-center">🏆</div>
      <p className="text-[10px] font-bold text-amber-600 text-center uppercase tracking-widest">
        Certificate of Completion
      </p>
      <h3 className="font-bold text-[#1A1A1A] text-center text-base leading-snug">{courseTitle}</h3>
      <p className="text-sm text-[#666] text-center">
        Awarded to <span className="font-semibold text-[#1A1A1A]">{studentName}</span>
      </p>
      <p className="text-xs text-[#888] text-center">{date}</p>

      {certificateUrl ? (
        <a
          href={certificateUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 text-center text-sm text-white bg-amber-500 hover:bg-amber-600 rounded-lg py-2 px-4 font-semibold transition-colors"
        >
          ↓ Download
        </a>
      ) : (
        <p className="text-xs text-[#888] text-center italic">Certificate generating…</p>
      )}
    </div>
  );
}
