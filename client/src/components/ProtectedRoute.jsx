import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Wraps a route that requires authentication.
// Redirects to /login if there is no active session.
// While the auth state is being restored from localStorage, renders nothing
// to avoid a flash of the login page for already-authenticated users.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
