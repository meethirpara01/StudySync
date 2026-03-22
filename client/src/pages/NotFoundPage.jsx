import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const GREEN = '#388250';

const NotFoundPage = () => {
  const { isDark } = useTheme();

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-8 relative py-12">
      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div 
          className="p-12 rounded-3xl backdrop-blur-lg border text-center space-y-10"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
          }}
        >
          {/* Icon */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 border"
            style={{
              background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              borderColor: 'rgb(239, 68, 68)',
              color: 'rgb(220, 38, 38)'
            }}
          >
            <AlertCircle className="w-12 h-12" />
          </div>

          {/* 404 Text */}
          <div>
            <h1 
              className="text-8xl font-black leading-none mb-4"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              404
            </h1>
            <h2 
              className="text-3xl font-black mb-6"
              style={{ fontFamily: "'Clash Display', sans-serif" }}
            >
              Lost in the Study Hall?
            </h2>
            <p
              className="text-lg leading-relaxed max-w-md mx-auto"
              style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }}
            >
              The page you're looking for has either been archived, moved, or never existed in the first place.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
              style={{
                background: GREEN,
                boxShadow: `0 0 24px ${GREEN}40`
              }}
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg transition-all border"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                color: isDark ? '#F2F2F2' : '#0C0C0C'
              }}
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              <span>Go Back</span>
            </motion.button>
          </div>

          {/* Footer Info */}
          <div className="pt-10 flex items-center justify-center gap-6" style={{ opacity: 0.3 }}>
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
              <Search className="w-4 h-4" />
              <span>Search Active</span>
            </div>
            <div className="w-2 h-2 rounded-full" style={{ background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest">
              <span>StudySync AI</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
