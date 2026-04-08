import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { toast } from 'react-toastify';

const CATEGORIES = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Other'];
const STEPS = ['Basics', 'Lessons', 'Publish'];

const emptyLesson = () => ({ title: '', videoUrl: '', duration: 0, order: 0 });

const inputCls = 'bg-[#F7F8FA] border border-[#EEF0F2] rounded-lg px-4 h-11 text-sm text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors w-full';
const labelCls = 'text-sm font-semibold text-[#1A1A1A] mb-1.5 block';

export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Programming',
    difficulty: 'beginner', price: 0, thumbnail: '', status: 'draft',
    lessons: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) api.get(`/courses/${id}`).then((r) => setForm(r.data));
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      if (id) await api.put(`/courses/${id}`, form);
      else     await api.post('/courses', form);
      toast.success(id ? 'Course updated!' : 'Course created!');
      navigate('/studio');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const addLesson = () =>
    setForm((f) => ({ ...f, lessons: [...f.lessons, { ...emptyLesson(), order: f.lessons.length + 1 }] }));

  const updateLesson = (idx, field, value) =>
    setForm((f) => { const ls = [...f.lessons]; ls[idx] = { ...ls[idx], [field]: value }; return { ...f, lessons: ls }; });

  const removeLesson = (idx) =>
    setForm((f) => ({ ...f, lessons: f.lessons.filter((_, i) => i !== idx) }));

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#EEF0F2] px-6 h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">E</div>
          <span className="font-bold text-[#1A1A1A]">Course Editor</span>
        </div>
        <button
          onClick={() => navigate('/studio')}
          className="text-sm text-[#888] bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-4 py-2 hover:bg-[#E2E8F0] transition-colors"
        >
          Save Draft
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center" style={{ flex: i < STEPS.length - 1 ? '1' : undefined }}>
              <button onClick={() => setStep(i)} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < step ? 'bg-indigo-600 text-white' :
                  i === step ? 'bg-indigo-600 text-white' :
                  'bg-[#E2E8F0] text-[#94A3B8]'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium ${i <= step ? 'text-indigo-600' : 'text-[#94A3B8]'}`}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-indigo-600' : 'bg-[#E2E8F0]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#EEF0F2] shadow-sm p-8">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">Step {step + 1} — {STEPS[step]}</h2>
          <p className="text-sm text-[#888] mb-7">
            {step === 0 && 'Fill in the basic course details.'}
            {step === 1 && 'Add and arrange your course lessons. Drag to reorder.'}
            {step === 2 && 'Review and publish your course.'}
          </p>

          {/* Step 0: Basics */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div><label className={labelCls}>Course title</label>
                <input placeholder="e.g. React & Next.js Complete Guide" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
              </div>
              <div><label className={labelCls}>Description</label>
                <textarea placeholder="What will students learn?" rows={4} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} h-auto py-3 resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={inputCls}>
                    {['beginner', 'intermediate', 'advanced'].map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Price ($)</label>
                  <input type="number" min={0} step={0.01} placeholder="49.00" value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} />
                </div>
                <div><label className={labelCls}>Thumbnail URL</label>
                  <input placeholder="https://..." value={form.thumbnail}
                    onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className={inputCls} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Lessons */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              {form.lessons.map((lesson, idx) => (
                <div key={idx} className="bg-[#F8F9FB] border border-[#EEF0F2] rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#94A3B8] text-lg cursor-grab select-none">≡</span>
                      <span className="text-xs font-bold text-[#888] uppercase tracking-wide">Lesson {idx + 1}</span>
                    </div>
                    <button onClick={() => removeLesson(idx)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                      🗑 Remove
                    </button>
                  </div>
                  <input placeholder="Lesson title" value={lesson.title}
                    onChange={(e) => updateLesson(idx, 'title', e.target.value)}
                    className="bg-white border border-[#EEF0F2] rounded-lg px-3 h-10 text-sm text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors" />
                  <div className="flex gap-3">
                    <input placeholder="Video URL (e.g. https://vimeo.com/...)" value={lesson.videoUrl}
                      onChange={(e) => updateLesson(idx, 'videoUrl', e.target.value)}
                      className="flex-1 bg-white border border-[#EEF0F2] rounded-lg px-3 h-10 text-sm text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors" />
                    <input type="number" min={0} placeholder="mins" value={lesson.duration}
                      onChange={(e) => updateLesson(idx, 'duration', Number(e.target.value))}
                      className="w-20 bg-white border border-[#EEF0F2] rounded-lg px-3 h-10 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors" />
                  </div>
                </div>
              ))}
              <button onClick={addLesson}
                className="w-full h-12 border-2 border-dashed border-indigo-300 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-[#EEF2FF] hover:border-indigo-500 transition-colors">
                + Add Lesson
              </button>
            </div>
          )}

          {/* Step 2: Publish */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div className="bg-[#F8F9FB] border border-[#EEF0F2] rounded-xl p-5 flex flex-col gap-2">
                <h3 className="font-semibold text-[#1A1A1A] mb-1">Review Summary</h3>
                {[
                  { label: 'Title',     value: form.title || '—' },
                  { label: 'Category',  value: form.category },
                  { label: 'Difficulty',value: form.difficulty },
                  { label: 'Price',     value: `$${Number(form.price).toFixed(2)}` },
                  { label: 'Lessons',   value: `${form.lessons.length} lesson${form.lessons.length !== 1 ? 's' : ''}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-[#888]">{label}</span>
                    <span className="font-medium text-[#1A1A1A]">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between bg-[#F8F9FB] border border-[#EEF0F2] rounded-xl p-4">
                <span className="text-sm font-semibold text-[#1A1A1A]">Publish immediately?</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#888] capitalize">{form.status}</span>
                  <button
                    onClick={() => setForm((f) => ({ ...f, status: f.status === 'published' ? 'draft' : 'published' }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.status === 'published' ? 'bg-indigo-600' : 'bg-[#E2E8F0]'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.status === 'published' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-[#EEF0F2]">
            <button
              onClick={() => step > 0 ? setStep(step - 1) : navigate('/studio')}
              className="text-sm text-[#64748B] bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg px-5 py-2.5 hover:bg-[#E2E8F0] transition-colors"
            >
              ← {step === 0 ? 'Cancel' : `Back to ${STEPS[step - 1]}`}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(step + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors">
                Continue to {STEPS[step + 1]} →
              </button>
            ) : (
              <button onClick={save} disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-8 py-2.5 text-sm disabled:opacity-50 transition-colors">
                {saving ? 'Saving…' : id ? 'Save Changes' : 'Create Course'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
