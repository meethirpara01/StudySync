import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import GroupPage from './pages/GroupPage';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import Navbar from './components/layout/Navbar';
import './styles/globals.css';

const GREEN = '#388250';

const AppContent = () => {
  const { user } = useSelector((state) => state.auth);
  const { isDark } = useTheme();

  return (
    <Router>
      <div
        className="min-h-screen flex flex-col"
        style={{
          background: isDark ? '#0C0C0C' : '#F5F7F5',
          color: isDark ? '#F2F2F2' : '#0C0C0C',
        }}
      >
        {/* Grid Background Pattern */}
        <div
          className="fixed inset-0 pointer-events-none -z-10"
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px),
                             linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 1px, transparent 1px)`,
            backgroundSize: '100px 100px',
          }}
        />

        {/* Glow Effects */}
        <div
          className="fixed top-1/4 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none -z-10"
          style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)` }}
        />
        <div
          className="fixed bottom-1/4 -left-40 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none -z-10"
          style={{ background: `radial-gradient(circle, ${GREEN} 0%, transparent 70%)` }}
        />

        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={!user ? <LoginPage /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/register"
              element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />}
            />
            <Route
              path="/dashboard"
              element={user ? <DashboardPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/group/:id"
              element={user ? <GroupPage /> : <Navigate to="/login" />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
