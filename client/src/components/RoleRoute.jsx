import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Wraps a route that requires a specific role.
// allowedRoles — array of roles permitted to access this route (e.g. ['instructor','admin'])
// Redirects authenticated users with wrong role to /dashboard.
// Redirects unauthenticated users to /login.
export default function RoleRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
