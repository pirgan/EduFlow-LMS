import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success(`Account created! Welcome, ${user.name}.`);
      if (user.role === 'instructor') navigate('/studio');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)' }}>

      <div className="w-full max-w-[420px] bg-white rounded-2xl p-10 shadow-xl shadow-indigo-100/60">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-7">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            E
          </div>
          <span className="font-bold text-lg text-[#1A1A1A]">EduFlow</span>
          <span className="text-sm text-[#888]">AI-Powered Learning</span>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#F7F8FA] rounded-lg p-1 mb-7">
          <Link
            to="/login"
            className="flex-1 py-2 text-center text-sm text-[#888] hover:text-[#1A1A1A] transition-colors"
          >
            Log In
          </Link>
          <div className="flex-1 bg-white rounded-md py-2 text-center text-sm font-semibold text-[#1A1A1A] shadow-sm">
            Register
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#1A1A1A]">Full name</label>
            <input
              placeholder="Jane Smith"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-[#F7F8FA] border border-[#EEF0F2] rounded-lg px-4 h-11 text-sm text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#1A1A1A]">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-[#F7F8FA] border border-[#EEF0F2] rounded-lg px-4 h-11 text-sm text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#1A1A1A]">Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-[#F7F8FA] border border-[#EEF0F2] rounded-lg px-4 h-11 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Role selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-[#1A1A1A]">I want to…</label>
            <div className="flex gap-3">
              {[
                { value: 'student', label: 'Learn' },
                { value: 'instructor', label: 'Teach' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                    form.role === value
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-[#F7F8FA] border-[#EEF0F2] text-[#666] hover:border-indigo-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center text-[#888] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
