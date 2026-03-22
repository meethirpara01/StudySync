import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../features/chat/chatSlice';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import socket from '../../sockets/socketClient';
import { MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const GREEN = '#388250';

const ChatWindow = ({ groupId }) => {
  const { isDark } = useTheme();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  const onReaction = (messageId, emoji) => {
    socket.emit('add_reaction', {
      messageId,
      userId: user._id,
      emoji,
      groupId
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    socket.on('user_typing', (data) => {
      setTypingUser(data.userName);
      setIsTyping(true);
    });

    socket.on('user_stop_typing', () => {
      setIsTyping(false);
      setTypingUser('');
    });

    return () => {
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, []);

  return (
    <div 
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background: isDark ? '#0C0C0C' : '#F5F7F5',
        color: isDark ? '#F2F2F2' : '#0C0C0C'
      }}
    >
      {/* Chat Header */}
      <div
        className={`px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md gap-3 ${isDark ? 'border-gray-700 bg-[#0F0F0F]/70' : 'border-gray-100 bg-white/70'}`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            className="p-2 sm:p-2.5 rounded-lg flex-shrink-0"
            style={{
              background: `#388250` + '20',
              color: '#388250'
            }}
          >
            <MessageSquare className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>Group Chat</h3>
            <p className={`text-xs font-medium flex items-center gap-1.5 mt-0.5 truncate ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: '#388250' }} />
              <span className="truncate">Real-time</span>
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border ${isDark ? 'bg-amber-900/40 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'} flex-shrink-0`}
        >
          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Moderated</span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className={`flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4 scrollbar-thin ${isDark ? 'scrollbar-thumb-gray-700' : 'scrollbar-thumb-gray-300'} scrollbar-track-transparent`}
        style={{
          scrollbarWidth: 'thin'
        }}
      >
        {isLoading ? (
          <div className={`flex flex-col justify-center items-center h-full gap-3 sm:gap-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Loader2 className="w-6 sm:w-8 h-6 sm:h-8 animate-spin" style={{ color: '#388250' }} />
            <p className="font-semibold text-xs sm:text-sm">Loading...</p>
          </div>
        ) : messages.length > 0 ? (
          <AnimatePresence mode="popLayout" initial={false}>
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg._id || index}
                message={msg}
                isOwn={msg.sender?._id === user._id}
                onReaction={onReaction}
                currentUser={user}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className={`flex flex-col items-center justify-center h-full text-center space-y-3 max-w-xs mx-auto`}>
            <div
              className={`p-4 sm:p-6 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-100/50'}`}
              style={{
                color: '#388250'
              }}
            >
              <MessageSquare className="w-8 sm:w-12 h-8 sm:h-12" />
            </div>
            <div>
              <h4 className={`text-base sm:text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Start
              </h4>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Send first message!
              </p>
            </div>
          </div>
        )}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-1.5 font-semibold text-xs px-2.5 py-2 rounded-lg w-fit ${isDark ? 'bg-green-900/20' : 'bg-green-100/50'}`}
            style={{
              color: '#388250'
            }}
          >
            <TypingIndicator />
            <span className="truncate">{typingUser} typing...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div
        className={`p-4 sm:p-6 border-t ${isDark ? 'border-gray-700 bg-[#0F0F0F]' : 'border-gray-100 bg-white'}`}
      >
        <ChatInput groupId={groupId} />
      </div>
    </div>
  );
};

export default ChatWindow;
