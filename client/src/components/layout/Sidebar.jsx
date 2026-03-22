import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../../features/auth/authSlice';
import {
  Home,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const GREEN = '#388250';

const Sidebar = () => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
    setIsOpen(false);
  };

  // Navigation items for authenticated users
  const navItems = user
    ? [
        { icon: Home, label: 'Home', href: '/', tooltip: 'Home' },
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', tooltip: 'My Groups' },
        { icon: MessageSquare, label: 'Chat', href: '/dashboard', tooltip: 'Messages' },
        { icon: Sparkles, label: 'AI', href: '#', tooltip: 'AI Assistant' },
        { icon: Users, label: 'Team', href: '#', tooltip: 'Team' },
      ]
    : [
        { icon: Home, label: 'Home', href: '/', tooltip: 'Home' },
        { icon: BookOpen, label: 'Learn', href: '/', tooltip: 'Learn More' },
      ];

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen w-20 border-r transition-colors z-40 ${
          isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        }`}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center justify-center h-20 border-b transition-colors"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 12 }}
            className="p-3 rounded-lg text-white flex-shrink-0"
            style={{ background: GREEN }}
          >
            <BookOpen className="w-5 h-5" />
          </motion.div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center gap-4 py-8 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <motion.div key={item.label} className="relative group w-full">
                <Link
                  to={item.href}
                  className="flex items-center justify-center p-4 rounded-lg transition-all w-full relative"
                  style={{
                    background: active ? GREEN : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: active ? '#fff' : isDark ? 'rgba(242,242,242,0.6)' : 'rgba(12,12,12,0.6)',
                    boxShadow: active ? `0 0 16px ${GREEN}40` : 'none',
                  }}
                >
                  <Icon className="w-5 h-5" />
                </Link>

                {/* Tooltip */}
                <div
                  className="hidden group-hover:block absolute left-24 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap pointer-events-none z-50"
                  style={{
                    background: isDark ? '#1a1a1a' : '#f9fafb',
                    color: GREEN,
                    border: `1px solid ${GREEN}`,
                  }}
                >
                  {item.tooltip}
                  <div
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                    style={{ background: isDark ? '#1a1a1a' : '#f9fafb', border: `1px solid ${GREEN}` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-3 py-6 px-3 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          {/* Theme Toggle */}
          <motion.div className="relative group w-full">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center p-4 rounded-lg transition-all w-full"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: isDark ? 'rgba(242,242,242,0.6)' : 'rgba(12,12,12,0.6)',
              }}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div
              className="hidden group-hover:block absolute left-24 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap pointer-events-none z-50"
              style={{
                background: isDark ? '#1a1a1a' : '#f9fafb',
                color: GREEN,
                border: `1px solid ${GREEN}`,
              }}
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
              <div
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                style={{ background: isDark ? '#1a1a1a' : '#f9fafb', border: `1px solid ${GREEN}` }}
              />
            </div>
          </motion.div>

          {user && (
            <>
              <motion.div className="relative group w-full">
                <button
                  className="flex items-center justify-center p-4 rounded-lg transition-all w-full"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? 'rgba(242,242,242,0.6)' : 'rgba(12,12,12,0.6)',
                  }}
                >
                  <Settings className="w-5 h-5" />
                </button>
                <div
                  className="hidden group-hover:block absolute left-24 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap pointer-events-none z-50"
                  style={{
                    background: isDark ? '#1a1a1a' : '#f9fafb',
                    color: GREEN,
                    border: `1px solid ${GREEN}`,
                  }}
                >
                  Settings
                  <div
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                    style={{ background: isDark ? '#1a1a1a' : '#f9fafb', border: `1px solid ${GREEN}` }}
                  />
                </div>
              </motion.div>

              <motion.div className="relative group w-full">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-4 rounded-lg transition-all w-full"
                  style={{
                    background: 'rgba(220, 38, 38, 0.1)',
                    color: 'rgb(220, 38, 38)',
                  }}
                >
                  <LogOut className="w-5 h-5" />
                </button>
                <div
                  className="hidden group-hover:block absolute left-24 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap pointer-events-none z-50"
                  style={{
                    background: isDark ? '#1a1a1a' : '#f9fafb',
                    color: 'rgb(220, 38, 38)',
                    border: '1px solid rgb(220, 38, 38)',
                  }}
                >
                  Logout
                  <div
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45"
                    style={{ background: isDark ? '#1a1a1a' : '#f9fafb', border: '1px solid rgb(220, 38, 38)' }}
                  />
                </div>
              </motion.div>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 p-4 rounded-lg z-50 text-white"
        style={{ background: GREEN, boxShadow: `0 0 24px ${GREEN}40` }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 md:hidden z-30"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed left-0 top-0 h-screen w-64 md:hidden z-40 flex flex-col p-6 overflow-y-auto border-r"
              style={{
                background: isDark ? 'rgb(12, 12, 12)' : 'rgb(255, 255, 255)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              {/* Mobile Logo */}
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 mb-8"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 12 }}
                  className="p-3 rounded-lg text-white flex-shrink-0"
                  style={{ background: GREEN }}
                >
                  <BookOpen className="w-5 h-5" />
                </motion.div>
                <span className="font-bold text-lg" style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}>
                  StudySync
                </span>
              </Link>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm"
                      style={{
                        background: active ? GREEN : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: active ? '#fff' : isDark ? 'rgba(242,242,242,0.7)' : 'rgba(12,12,12,0.7)',
                        boxShadow: active ? `0 0 16px ${GREEN}40` : 'none',
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Bottom Section */}
              <div className="flex flex-col gap-2 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                {/* Theme Toggle */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? 'rgba(242,242,242,0.7)' : 'rgba(12,12,12,0.7)',
                  }}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {user && (
                  <>
                    <button
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: isDark ? 'rgba(242,242,242,0.7)' : 'rgba(12,12,12,0.7)',
                      }}
                    >
                      <Settings className="w-5 h-5" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm"
                      style={{
                        background: 'rgba(220, 38, 38, 0.1)',
                        color: 'rgb(220, 38, 38)',
                      }}
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
