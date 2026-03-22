import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserGroups, getAllGroups, joinGroup, reset } from '../features/groups/groupSlice';
import GroupCard from '../components/groups/GroupCard';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import { Plus, Search, Loader2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const GREEN = '#388250';

const DashboardPage = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('my-groups'); // 'my-groups' or 'discover'

  const { groups, isLoading, isError, message } = useSelector(
    (state) => state.groups
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (view === 'my-groups') {
      dispatch(getUserGroups());
    } else {
      dispatch(getAllGroups());
    }
    return () => {
      dispatch(reset());
    };
  }, [dispatch, view]);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onJoinGroup = async (groupId) => {
    try {
      await dispatch(joinGroup(groupId)).unwrap();
      setView('my-groups');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col relative">
      {/* Content Container */}
      <div className="w-full pt-12 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12"
          >
            <div className="flex-1">
              <h1 
                className="text-5xl font-black mb-4"
                style={{ fontFamily: "'Clash Display', sans-serif" }}
              >
                {view === 'my-groups' ? 'My Study' : 'Discover'} <span style={{ color: GREEN }}>Groups</span>
              </h1>
              <p
                className="text-lg"
                style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }}
              >
                {view === 'my-groups' 
                  ? 'Manage and access your collaborative study sessions' 
                  : 'Browse and join public study groups to learn together'}
              </p>
            </div>
            <div className="flex gap-4 lg:flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView(view === 'my-groups' ? 'discover' : 'my-groups')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                  color: isDark ? '#F2F2F2' : '#0C0C0C'
                }}
              >
                <Search className="w-5 h-5" />
                <span>{view === 'my-groups' ? 'Discover' : 'My Groups'}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all"
                style={{
                  background: GREEN,
                  boxShadow: `0 0 24px ${GREEN}40`
                }}
              >
                <Plus className="w-5 h-5" />
                <span>Create Group</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative group mb-12 max-w-md"
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
              style={{
                color: isDark ? 'rgba(242,242,242,0.25)' : 'rgba(12,12,12,0.3)'
              }}
            />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all outline-none backdrop-blur-lg"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                color: isDark ? '#F2F2F2' : '#0C0C0C'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = GREEN;
                e.target.style.boxShadow = `0 0 0 3px ${GREEN}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </motion.div>

          {/* Groups Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="w-12 h-12 animate-spin" style={{ color: GREEN }} />
            </div>
          ) : isError ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 rounded-3xl text-center border"
              style={{
                background: isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                borderColor: 'rgb(239, 68, 68)',
                color: 'rgb(220, 38, 38)'
              }}
            >
              <p className="text-lg font-bold">{message}</p>
            </motion.div>
          ) : filteredGroups.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredGroups.map((group, i) => (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GroupCard 
                      group={group} 
                      showJoinButton={view === 'discover' && !group.members.some(m => m === user?._id || m?._id === user?._id)}
                      onJoin={() => onJoinGroup(group._id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 rounded-3xl border-2 border-dashed"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: isDark ? 'rgba(56,130,80,0.1)' : `${GREEN}15`,
                  color: GREEN
                }}
              >
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                No groups found
              </h3>
              <p
                className="mb-8 max-w-sm mx-auto"
                style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }}
              >
                {searchTerm ? `No results for "${searchTerm}". Try another search term.` : "You haven't joined any study groups yet. Start by creating one!"}
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all"
                  style={{
                    background: GREEN,
                    boxShadow: `0 0 24px ${GREEN}40`
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Group</span>
                </motion.button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
