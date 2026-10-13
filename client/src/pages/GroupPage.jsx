import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getGroupById, reset, acceptInvite, approveJoinRequest, rejectJoinRequest, leaveGroup } from '../features/groups/groupSlice';
import { getGroupMessages, addMessage, updateMessage } from '../features/chat/chatSlice';
import ChatWindow from '../components/chat/ChatWindow';
import AIAssistantPanel from '../components/ai/AIAssistantPanel';
import NotesEditor from '../components/notes/NotesEditor';
import socket from '../sockets/socketClient';
import { Users, MessageSquare, Sparkles, FileText, Loader2, ArrowLeft, ChevronRight, UserPlus, Check, LogOut, Trash2 } from 'lucide-react';
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedNewAdmin, setSelectedNewAdmin] = useState('');
  const [leaveActionError, setLeaveActionError] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [requestActionError, setRequestActionError] = useState('');

  const { user } = useSelector((state) => state.auth);
  const { currentGroup, isLoading: groupLoading } = useSelector((state) => state.groups);

  const onInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMember = currentGroup?.members?.some((member) => member?._id === user?._id || member === user?._id);
  const isAdmin = currentGroup?.createdBy?._id === user?._id || currentGroup?.createdBy === user?._id;
  const adminCandidates = currentGroup?.members?.filter((member) => (member?._id || member) !== user?._id) || [];

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

  useEffect(() => {
    if (currentGroup && user && !isMember && !isAdmin) {
      setShowInviteModal(true);
    }
  }, [currentGroup, user, isMember, isAdmin]);

  // Save active tab to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`activeTab_${id}`, activeTab);
    } catch (error) {
      console.error('Error saving active tab:', error);
    }
  }, [activeTab, id]);

  const handleAcceptInvite = async () => {
    try {
      await dispatch(acceptInvite(id)).unwrap();
      setShowInviteModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproveRequest = async (requestUserId) => {
    try {
      setProcessingRequestId(requestUserId);
      setRequestActionError('');
      await dispatch(approveJoinRequest({ groupId: id, userId: requestUserId })).unwrap();
      setShowRequestsModal(false);
    } catch (error) {
      setRequestActionError(error || 'Unable to approve this request.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestUserId) => {
    try {
      setProcessingRequestId(requestUserId);
      setRequestActionError('');
      await dispatch(rejectJoinRequest({ groupId: id, userId: requestUserId })).unwrap();
      setShowRequestsModal(false);
    } catch (error) {
      setRequestActionError(error || 'Unable to reject this request. Restart the server and try again.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleLeaveGroup = async (action = 'leave') => {
    try {
      setIsLeaving(true);
      setLeaveActionError('');
      const options = action === 'delete'
        ? { action: 'delete' }
        : isAdmin
          ? { action: 'transfer', newAdminId: selectedNewAdmin }
          : { action: 'leave' };
      await dispatch(leaveGroup({ groupId: id, options })).unwrap();
      setShowLeaveModal(false);
      navigate('/dashboard');
    } catch (error) {
      setLeaveActionError(error || 'Unable to leave this group.');
    } finally {
      setIsLeaving(false);
    }
  };

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
      {showLeaveModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border shadow-2xl p-6"
            style={{ background: isDark ? '#151515' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest font-bold" style={{ color: GREEN }}>Group settings</p>
                <h2 className="text-2xl font-black mt-1">Leave {currentGroup.name}?</h2>
              </div>
              <button onClick={() => setShowLeaveModal(false)} className="w-9 h-9 rounded-lg border text-lg font-bold" aria-label="Close leave group dialog">×</button>
            </div>

            {leaveActionError && <div className="mb-4 rounded-xl border px-4 py-3 text-sm font-semibold" style={{ color: '#DC2626', borderColor: '#DC262655', background: '#DC262610' }}>{leaveActionError}</div>}

            {isAdmin ? (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: isDark ? 'rgba(242,242,242,0.65)' : 'rgba(12,12,12,0.65)' }}>
                  You are the admin. Assign another member before leaving, or permanently delete this group.
                </p>
                <label className="block text-sm font-bold">
                  New group admin
                  <select
                    value={selectedNewAdmin}
                    onChange={(event) => setSelectedNewAdmin(event.target.value)}
                    className="mt-2 w-full rounded-xl border px-4 py-3 bg-transparent"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}
                  >
                    <option value="">Select a member</option>
                    {adminCandidates.map((member) => <option key={member._id || member} value={member._id || member}>{member.name || 'Group member'}</option>)}
                  </select>
                </label>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <button onClick={() => handleLeaveGroup('delete')} disabled={isLeaving} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold border disabled:opacity-50" style={{ color: '#DC2626', borderColor: '#DC262655' }}>
                    <Trash2 className="w-4 h-4" /> Delete Group
                  </button>
                  <button onClick={() => handleLeaveGroup('transfer')} disabled={isLeaving || !selectedNewAdmin} className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white disabled:opacity-50" style={{ background: GREEN }}>
                    <LogOut className="w-4 h-4" /> Assign New Admin and Leave
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowLeaveModal(false)} className="px-4 py-3 rounded-xl font-bold border">Cancel</button>
                <button onClick={() => handleLeaveGroup()} disabled={isLeaving} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-white disabled:opacity-50" style={{ background: GREEN }}>
                  <LogOut className="w-4 h-4" /> Leave Group
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {showRequestsModal && isAdmin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              background: isDark ? '#151515' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold" style={{ color: GREEN }}>Admin review</p>
                <h2 className="text-xl font-black mt-1">Pending join requests</h2>
              </div>
              <button
                onClick={() => setShowRequestsModal(false)}
                className="w-9 h-9 rounded-lg border text-lg font-bold"
                aria-label="Close join requests"
              >
                ×
              </button>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto">
              {requestActionError && (
                <div className="mb-4 rounded-xl border px-4 py-3 text-sm font-semibold" style={{ color: '#DC2626', borderColor: '#DC262655', background: '#DC262610' }}>
                  {requestActionError}
                </div>
              )}
              {currentGroup.joinRequests?.length > 0 ? (
                <div className="space-y-3">
                  {currentGroup.joinRequests.map((request) => {
                    const requestUser = request.user || request;
                    const requestUserId = requestUser?._id || requestUser;
                    return (
                      <div key={requestUserId} className="flex items-center justify-between gap-4 p-3 rounded-xl border" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0" style={{ background: GREEN }}>
                            {(requestUser?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold truncate">{requestUser?.name || 'StudySync member'}</p>
                            <p className="text-xs truncate" style={{ color: isDark ? 'rgba(242,242,242,0.5)' : 'rgba(12,12,12,0.5)' }}>{requestUser?.email || 'Wants to join this group'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => handleRejectRequest(requestUserId)} disabled={processingRequestId === requestUserId} className="px-3 py-2 rounded-lg border text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed" style={{ color: '#DC2626', borderColor: '#DC262655' }}>
                            {processingRequestId === requestUserId ? 'Working...' : 'Reject'}
                          </button>
                          <button onClick={() => handleApproveRequest(requestUserId)} disabled={processingRequestId === requestUserId} className="px-3 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: GREEN }}>
                            Accept
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Users className="w-10 h-10 mx-auto mb-3" style={{ color: GREEN }} />
                  <p className="font-bold">No pending requests</p>
                  <p className="text-sm mt-1" style={{ color: isDark ? 'rgba(242,242,242,0.5)' : 'rgba(12,12,12,0.5)' }}>New requests will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showInviteModal && !isMember && !isAdmin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border p-8 shadow-2xl"
            style={{
              background: isDark ? '#111827' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-bold" style={{ color: GREEN }}>Group Invitation</p>
                <h2 className="text-3xl font-black mt-2" style={{ fontFamily: "'Clash Display', sans-serif" }}>{currentGroup.name}</h2>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="text-lg font-bold" style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}>✕</button>
            </div>

            <div className="space-y-4 text-sm" style={{ color: isDark ? 'rgba(242,242,242,0.7)' : 'rgba(12,12,12,0.7)' }}>
              <div className="rounded-2xl border p-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: GREEN }}>Subject</p>
                <p className="text-lg font-bold" style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}>{currentGroup.subject}</p>
              </div>

              <div className="rounded-2xl border p-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: GREEN }}>Description</p>
                <p>{currentGroup.description}</p>
              </div>

              <div className="rounded-2xl border p-4" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
                <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: GREEN }}>Group Admin</p>
                <p className="font-semibold" style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}>{currentGroup.createdBy?.name || 'Unknown admin'}</p>
                <p>{currentGroup.createdBy?.email || 'admin@studysync'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-5 py-3 rounded-xl font-bold border"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  color: isDark ? '#F2F2F2' : '#0C0C0C',
                }}
              >
                Decline
              </button>
              <button
                onClick={handleAcceptInvite}
                className="px-5 py-3 rounded-xl font-bold text-white"
                style={{ background: GREEN, boxShadow: `0 0 20px ${GREEN}50` }}
              >
                Accept Invite
              </button>
            </div>
          </div>
        </div>
      )}

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
          
          <div className="flex flex-wrap items-center justify-end gap-2 lg:gap-4">
            {isAdmin && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRequestsModal(true)}
                className="relative flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all border"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: isDark ? '#F2F2F2' : '#0C0C0C'
                }}
              >
                <Users className="w-5 h-5" />
                <span>Join requests</span>
                {currentGroup.joinRequests?.length > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full text-xs flex items-center justify-center text-white" style={{ background: GREEN }}>
                    {currentGroup.joinRequests.length}
                  </span>
                )}
              </motion.button>
            )}
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
            {isMember && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setLeaveActionError(''); setShowLeaveModal(true); }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: isDark ? '#F2F2F2' : '#0C0C0C'
                }}
              >
                <LogOut className="w-5 h-5" />
                <span>Leave Group</span>
              </motion.button>
            )}
            
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
                  className="absolute lg:static inset-0 top-12 lg:inset-auto lg:top-auto w-full lg:h-auto flex-1 flex flex-col min-h-0"
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
                  className="absolute lg:static inset-0 top-12 lg:inset-auto lg:top-auto w-full lg:h-auto flex-1 flex flex-col overflow-hidden min-h-0"
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
                  className="absolute lg:static inset-0 top-12 lg:inset-auto lg:top-auto w-full lg:h-auto flex-1 flex flex-col overflow-auto min-h-0"
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
