import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/courses?q=${encodeURIComponent(query.trim())}`);
  };

  const dashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return { to: '/admin', label: 'Admin Panel' };
    if (user.role === 'instructor') return { to: '/studio', label: 'Studio' };
    return { to: '/dashboard', label: 'My Learning' };
  };

  const dash = dashboardLink();

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#EEF0F2] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <span className="font-bold text-[17px] text-[#1A1A1A] tracking-tight">EduFlow</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses…"
            className="w-full bg-[#F7F8FA] border border-[#EEF0F2] rounded-full px-4 py-2 text-sm text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors"
          />
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-3 text-sm relative">
          <Link to="/courses" className="hidden md:block text-[#666] hover:text-indigo-600 transition-colors">
            Browse
          </Link>

          {user ? (
            <>
              {dash && (
                <Link to={dash.to} className="hidden md:block text-[#666] hover:text-indigo-600 transition-colors">
                  {dash.label}
                </Link>
              )}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 hover:bg-indigo-700 transition-colors"
              >
                {user.name?.[0]?.toUpperCase() || 'U'}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 bg-white border border-[#EEF0F2] rounded-xl shadow-lg py-1.5 w-44 z-50">
                  <p className="px-4 py-1.5 text-xs text-[#888] truncate">{user.email}</p>
                  <div className="my-1 border-t border-[#EEF0F2]" />
                  {dash && (
                    <Link
                      to={dash.to}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F7F8FA] transition-colors"
                    >
                      {dash.label}
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#F7F8FA] transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="text-[#666] hover:text-indigo-600 transition-colors px-2 py-1.5">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-indigo-700 transition-colors text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
