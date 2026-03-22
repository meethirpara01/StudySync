import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getGroupById, reset } from '../features/groups/groupSlice';
import { getGroupMessages, addMessage, updateMessage } from '../features/chat/chatSlice';
import ChatWindow from '../components/chat/ChatWindow';
import AIAssistantPanel from '../components/ai/AIAssistantPanel';
import NotesEditor from '../components/notes/NotesEditor';
import socket from '../sockets/socketClient';
import { Users, MessageSquare, Sparkles, FileText, Loader2, ArrowLeft, ChevronRight, Settings, UserPlus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const GREEN = '#388250';

const GroupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  
  // Initialize activeTab from localStorage, default to 'chat'
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem(`activeTab_${id}`) || 'chat';
    } catch (error) {
      return 'chat';
    }
  });
  const [copied, setCopied] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { currentGroup, isLoading: groupLoading } = useSelector((state) => state.groups);

  const onInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    dispatch(getGroupById(id));
    dispatch(getGroupMessages(id));

    socket.connect();
    socket.emit('join_group', id);

    socket.on('receive_message', (message) => {
      dispatch(addMessage(message));
    });

    socket.on('message_updated', (updatedMessage) => {
      dispatch(updateMessage(updatedMessage));
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_updated');
      socket.disconnect();
      dispatch(reset());
    };
  }, [id, dispatch]);

  // Save active tab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`activeTab_${id}`, activeTab);
    } catch (error) {
      console.error('Error saving active tab:', error);
    }
  }, [activeTab, id]);

  if (groupLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col justify-center items-center gap-6 py-12">
        <Loader2 className="w-16 h-16 animate-spin" style={{ color: GREEN }} />
        <p className="font-bold text-xl tracking-widest uppercase" style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }}>
          Syncing Workspace...
        </p>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-8 relative py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl p-12 rounded-3xl border backdrop-blur-lg"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
          }}
        >
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            Workspace not found
          </h2>
          <p 
            className="mb-10 text-lg"
            style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }}
          >
            The study group you're looking for doesn't exist or you don't have access.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all"
            style={{
              background: GREEN,
              boxShadow: `0 0 24px ${GREEN}40`
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'chat', label: 'Discussions', icon: MessageSquare },
    { id: 'notes', label: 'Shared Notes', icon: FileText },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles },
  ];

  return (
    <div className="w-full h-screen flex flex-col p-6 md:p-8 lg:p-10 relative overflow-hidden">
      {/* Content */}
      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 rounded-2xl border backdrop-blur-lg flex-shrink-0"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
          }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="p-3 rounded-xl transition-all border"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
              }}
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div>
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest mb-1" style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.45)' }}>
                <span>{currentGroup.subject}</span>
                <ChevronRight className="w-4 h-4" />
                <span style={{ color: GREEN }}>{currentGroup.name}</span>
              </div>
              <h1 className="text-2xl font-black" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                {currentGroup.name}
              </h1>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onInvite}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border"
              style={{
                background: copied ? `${GREEN}20` : GREEN,
                borderColor: copied ? GREEN : GREEN,
                color: copied ? GREEN : '#fff'
              }}
            >
              {copied ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              <span>{copied ? 'Link Copied!' : 'Invite'}</span>
            </motion.button>
            
            <div className="flex -space-x-2 px-4 py-2 rounded-xl border" style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
            }}>
              {currentGroup.members?.slice(0, 5).map((member, i) => (
                <div 
                  key={i} 
                  className="inline-flex h-10 w-10 rounded-lg items-center justify-center font-bold text-sm border-2 flex-shrink-0"
                  title={member?.name || 'User'}
                  style={{
                    background: GREEN,
                    color: '#fff',
                    borderColor: isDark ? '#0C0C0C' : '#F5F7F5'
                  }}
                >
                  {member?.name ? member.name.charAt(0) : '?'}
                </div>
              ))}
              {currentGroup.members?.length > 5 && (
                <div className="flex items-center justify-center h-10 w-10 rounded-lg font-bold text-sm border-2 flex-shrink-0"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
                  }}
                >
                  +{currentGroup.members.length - 5}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
          {/* Tab Buttons (Left Side - Desktop Only) */}
          <div className="hidden lg:flex flex-col gap-3 flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className="p-4 rounded-xl transition-all border"
                  style={{
                    background: isActive ? GREEN : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                    borderColor: isActive ? GREEN : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'),
                    color: isActive ? '#fff' : (isDark ? '#F2F2F2' : '#0C0C0C'),
                    boxShadow: isActive ? `0 0 24px ${GREEN}40` : 'none'
                  }}
                  title={tab.label}
                >
                  <Icon className="w-6 h-6" />
                </motion.button>
              );
            })}
          </div>

          {/* Content Pane */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 rounded-2xl border overflow-hidden backdrop-blur-lg relative min-h-0 flex flex-col"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
            }}
          >
            {/* Mobile Tab Selector (Hidden on Desktop) */}
            <div className="lg:hidden flex gap-2 p-3 px-4 border-b relative z-50" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all border text-xs sm:text-sm font-semibold"
                    style={{
                      background: isActive ? GREEN : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                      borderColor: isActive ? GREEN : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'),
                      color: isActive ? '#fff' : (isDark ? '#F2F2F2' : '#0C0C0C'),
                      boxShadow: isActive ? `0 0 16px ${GREEN}40` : 'none'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute lg:static inset-0 top-12 lg:inset-auto lg:top-auto w-full lg:h-auto flex-1 lg:flex-none flex flex-col min-h-0"
                >
                  <ChatWindow groupId={id} />
                </motion.div>
              )}
              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute lg:static inset-0 top-12 lg:inset-auto lg:top-auto w-full lg:h-auto flex-1 lg:flex-none flex flex-col p-8 overflow-auto min-h-0"
                >
                  <NotesEditor groupId={id} />
                </motion.div>
              )}
              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute lg:static inset-0 top-12 lg:inset-auto lg:top-auto w-full lg:h-auto flex-1 lg:flex-none flex flex-col overflow-auto min-h-0"
                >
                  <AIAssistantPanel groupId={id} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
