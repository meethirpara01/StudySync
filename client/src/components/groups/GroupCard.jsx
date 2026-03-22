import { Link } from 'react-router-dom';
import { Users, Calendar, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const GREEN = '#388250';

const GroupCard = ({ group, showJoinButton, onJoin }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl p-6 border backdrop-blur-lg hover:shadow-lg hover:-translate-y-2 transition-all group flex flex-col justify-between relative overflow-hidden"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
        borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
      }}
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${GREEN}, transparent)`
        }}
      />

      <div className="relative space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0"
            style={{
              background: `${GREEN}20`,
              color: GREEN
            }}
          >
            <BookOpen className="w-6 h-6" />
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border"
            style={{
              background: isDark ? 'rgba(56,130,80,0.1)' : `${GREEN}10`,
              borderColor: GREEN,
              color: GREEN
            }}
          >
            <Users className="w-4 h-4" />
            <span>{group.members?.length || 0}</span>
          </div>
        </div>

        <div>
          <h3 
            className="text-xl font-black mb-2 group-hover:text-opacity-80 transition-colors leading-tight"
            style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}
          >
            {group.name}
          </h3>
          <p
            className="px-2 py-1 rounded-lg inline-block text-xs font-bold mb-3 border"
            style={{
              background: isDark ? 'rgba(56,130,80,0.1)' : `${GREEN}10`,
              borderColor: GREEN,
              color: GREEN
            }}
          >
            {group.subject}
          </p>
          <p
            className="leading-relaxed line-clamp-2"
            style={{ color: isDark ? 'rgba(242,242,242,0.6)' : 'rgba(12,12,12,0.6)' }}
          >
            {group.description}
          </p>
        </div>
      </div>

      <div
        className="pt-4 mt-4 flex items-center justify-between gap-4"
        style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}
      >
        <div 
          className="flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg"
          style={{
            background: isDark ? 'rgba(56,130,80,0.1)' : `${GREEN}10`,
            color: GREEN
          }}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Active</span>
        </div>
        {showJoinButton ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.preventDefault();
              onJoin();
            }}
            className="px-4 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-2 text-sm"
            style={{
              background: GREEN,
              boxShadow: `0 0 12px ${GREEN}40`
            }}
          >
            <span>Join</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <Link
            to={`/group/${group._id}`}
            className="flex items-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-2 text-sm"
              style={{
                background: GREEN,
                boxShadow: `0 0 12px ${GREEN}40`
              }}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="sr-only">Enter Group</span>
            </motion.button>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default GroupCard;
