import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import { BookOpen, LogOut, LayoutDashboard, Moon, Sun, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const GREEN = '#388250';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full sticky top-0 z-50 backdrop-blur-lg border-b"
        style={{
          background: isDark ? 'rgba(12,12,12,0.8)' : 'rgba(245,247,245,0.8)',
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
        }}
      >
        <div className="px-6 md:px-12 lg:px-20 flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 font-bold text-xl group flex-shrink-0"
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="p-2 rounded-lg text-white flex-shrink-0"
              style={{ background: GREEN }}
            >
              <BookOpen className="w-5 h-5" />
            </motion.div>
            <span 
              className="hidden sm:inline transition-colors"
              style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}
            >
              StudySync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all border"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                color: isDark ? '#F2F2F2' : '#0C0C0C'
              }}
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-2 transition-colors font-medium group"
                  style={{ color: isDark ? 'rgba(242,242,242,0.7)' : 'rgba(12,12,12,0.7)' }}
                >
                  <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Dashboard</span>
                </Link>
                
                <div className="flex items-center gap-4 pl-4" style={{ borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}>
                  <motion.div 
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-2 font-medium"
                    style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: GREEN }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline">{user.name}</span>
                  </motion.div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onLogout}
                    className="p-2 rounded-lg transition-all border"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                      color: 'rgb(220, 38, 38)'
                    }}
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  to="/login" 
                  className="font-medium transition-colors"
                  style={{ color: isDark ? 'rgba(242,242,242,0.7)' : 'rgba(12,12,12,0.7)' }}
                >
                  Login
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 rounded-lg font-bold text-white transition-all"
                    style={{
                      background: GREEN,
                      boxShadow: `0 0 16px ${GREEN}40`
                    }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg border transition-all"
            style={{
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
              color: isDark ? '#F2F2F2' : '#0C0C0C'
            }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t px-6 py-6"
            style={{
              background: isDark ? 'rgba(12,12,12,0.6)' : 'rgba(245,247,245,0.6)',
              borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
            }}
          >
            <div className="space-y-4">
              {/* Theme Toggle Mobile */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  toggleTheme();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium border transition-all"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                  color: isDark ? '#F2F2F2' : '#0C0C0C'
                }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </motion.button>

              {user ? (
                <>
                  <Link 
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium border transition-all"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                      color: isDark ? '#F2F2F2' : '#0C0C0C'
                    }}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>

                  <div className="py-3 px-4 rounded-lg" style={{
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                    border: '1px solid'
                  }}>
                    <div className="flex items-center gap-3 justify-center mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: GREEN }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}>{user.name}</span>
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onLogout();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium border transition-all text-red-500"
                    style={{
                      background: 'rgba(220, 38, 38, 0.1)',
                      borderColor: 'rgb(220, 38, 38)'
                    }}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center py-3 rounded-lg font-medium border transition-all"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                      color: isDark ? '#F2F2F2' : '#0C0C0C'
                    }}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-lg font-bold text-white transition-all"
                      style={{
                        background: GREEN,
                        boxShadow: `0 0 16px ${GREEN}40`
                      }}
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>
    </>
  );
};

export default Navbar;
