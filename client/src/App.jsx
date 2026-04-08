import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import RoleRoute from './components/RoleRoute.jsx';
import AIChatbot from './components/AIChatbot.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CourseCatalogue from './pages/CourseCatalogue.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import LessonPlayer from './pages/LessonPlayer.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import InstructorStudio from './pages/InstructorStudio.jsx';
import CourseEditor from './pages/CourseEditor.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Certificate from './pages/Certificate.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/"            element={<Home />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/courses"     element={<CourseCatalogue />} />
          <Route path="/courses/:id" element={<CourseDetail />} />

          {/* Student — requires any authenticated user */}
          <Route path="/dashboard"             element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/learn/:courseId"       element={<ProtectedRoute><LessonPlayer /></ProtectedRoute>} />
          <Route path="/certificate/:courseId" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />

          {/* Instructor — requires instructor or admin role */}
          <Route path="/studio"          element={<RoleRoute allowedRoles={['instructor', 'admin']}><InstructorStudio /></RoleRoute>} />
          <Route path="/studio/new"      element={<RoleRoute allowedRoles={['instructor', 'admin']}><CourseEditor /></RoleRoute>} />
          <Route path="/studio/edit/:id" element={<RoleRoute allowedRoles={['instructor', 'admin']}><CourseEditor /></RoleRoute>} />

          {/* Admin only */}
          <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><AdminPanel /></RoleRoute>} />
        </Routes>

        {/* AI Chatbot floats over all pages — mounted outside Routes so it persists navigation */}
        <AIChatbot />

        <ToastContainer position="bottom-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
