import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'instructor') navigate('/studio');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
          <div className="flex-1 bg-white rounded-md py-2 text-center text-sm font-semibold text-[#1A1A1A] shadow-sm">
            Log In
          </div>
          <Link
            to="/register"
            className="flex-1 py-2 text-center text-sm text-[#888] hover:text-[#1A1A1A] transition-colors"
          >
            Register
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-[#1A1A1A]">Password</label>
              <span className="text-xs text-indigo-600 cursor-pointer hover:underline">Forgot password?</span>
            </div>
            <input
              type="password"
              placeholder="••••••••••"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="bg-[#F7F8FA] border border-[#EEF0F2] rounded-lg px-4 h-11 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-center text-[#888] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
