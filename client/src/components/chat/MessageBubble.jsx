import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { User, Sparkles, AlertCircle, ShieldCheck, Heart, ThumbsUp, FileText, Download, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../../context/ThemeContext';

const MessageBubble = ({ message, isOwn, onReaction, currentUser }) => {
  const { isDark } = useTheme();
  const isAI = message.type === 'ai';
  const isSystem = message.type === 'system';
  const isFile = message.type === 'file' || (message.fileName && !message.type);
  const isLink = message.type === 'link';

  const onDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!message.fileData) {
      console.error('No file data available for download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = message.fileData;
      link.setAttribute('download', message.fileName || 'download');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const reactions = message.reactions || [];
  const hasLiked = reactions.some(r => {
    const reactionUserId = typeof r.user === 'object' ? r.user._id : r.user;
    return reactionUserId === currentUser?._id;
  });

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center items-center py-4"
      >
        <div className={`${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-100/50 border-gray-100'} backdrop-blur-sm px-6 py-2 rounded-full border flex items-center gap-2`}>
          <AlertCircle className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-widest`}>{message.content}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: isOwn ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 150 }}
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} space-y-3 group`}
    >
      <div className={`flex items-end gap-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div 
          className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-lg shadow-sm transition-transform group-hover:scale-110 ${
            isAI ? 'bg-amber-500 text-white' : isOwn ? 'bg-primary text-white' : isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isAI ? <Sparkles className="w-6 h-6" /> : message.sender?.name?.charAt(0) || <User className="w-6 h-6" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col max-w-lg ${isOwn ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>
              {isAI ? 'StudySync AI' : isOwn ? 'You' : message.sender?.name}
            </span>
            <span className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-tighter`}>
              {message.createdAt ? format(new Date(message.createdAt), 'h:mm a') : 'Just now'}
            </span>
            {isAI && (
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full text-[9px] font-black text-amber-600 uppercase border border-amber-100">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Verified</span>
              </div>
            )}
          </div>
          
          <div
            className={`px-6 py-4 rounded-[1.8rem] text-sm font-medium leading-relaxed shadow-sm relative group/bubble ${
              isAI
                ? 'bg-amber-50 text-gray-800 border border-amber-100 rounded-tl-none'
                : isOwn
                ? 'bg-gray-900 text-white rounded-tr-none'
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
            }`}
          >
            {isFile ? (
              <div className="flex flex-col gap-3 min-w-[200px]">
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className={`p-2 rounded-xl ${isOwn ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`text-sm font-bold truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>{message.fileName || 'Attachment'}</p>
                    <p className={`text-[10px] font-bold uppercase opacity-60 ${isOwn ? 'text-white' : 'text-gray-500'}`}>
                      {message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : 'File'}
                    </p>
                  </div>
                  <div 
                    onClick={onDownload}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${isOwn ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-400'}`}
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </div>
                </div>
                {message.content && <p className={isOwn ? 'text-white/90' : 'text-gray-600'}>{message.content}</p>}
              </div>
            ) : isLink || message.content?.includes('http') || message.content?.includes('www.') ? (() => {
              // Regex to match URLs (including those without http prefix)
              const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
              const matches = message.content?.match(urlRegex);
              
              if (!matches) return message.content;

              const url = matches[0];
              const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
              const otherText = message.content.replace(url, '').trim();
              
              return (
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <a 
                    href={cleanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isOwn ? 'bg-white/10 border-white/10 hover:bg-white/20 text-white' : 'bg-blue-50 border-blue-100 hover:bg-blue-100 text-blue-600'}`}
                  >
                    <div className={`p-2 rounded-xl ${isOwn ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-0.5">Study Resource</p>
                      <p className="text-sm font-bold truncate underline underline-offset-4">{url}</p>
                    </div>
                  </a>
                  {/* Show the rest of the text if it was more than just a URL */}
                  {otherText && (
                    <p className={`text-sm ${isOwn ? 'text-white/90' : 'text-gray-600'}`}>
                      {otherText}
                    </p>
                  )}
                </div>
              );
            })() : (
              isAI ? (
                <div className={`prose prose-sm max-w-none ${isOwn ? 'prose-invert' : ''} prose-headings:text-sm prose-headings:font-black prose-p:m-0 prose-p:mb-2 prose-ul:my-2 prose-ol:my-2 prose-li:marker:font-bold`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h2 className={`font-black text-sm mb-2 ${isOwn ? 'text-white' : 'text-gray-900'}`} {...props} />,
                      h2: ({node, ...props}) => <h3 className={`font-black text-sm mb-2 ${isOwn ? 'text-white' : 'text-gray-900'}`} {...props} />,
                      h3: ({node, ...props}) => <h4 className={`font-bold text-xs mb-1 ${isOwn ? 'text-white' : 'text-gray-800'}`} {...props} />,
                      p: ({node, ...props}) => <p className={`text-sm mb-2 leading-relaxed ${isOwn ? 'text-white/90' : 'text-gray-700'}`} {...props} />,
                      ul: ({node, ...props}) => <ul className={`list-disc list-inside space-y-1 my-2 text-sm ${isOwn ? 'text-white/90' : 'text-gray-700'}`} {...props} />,
                      ol: ({node, ...props}) => <ol className={`list-decimal list-inside space-y-1 my-2 text-sm ${isOwn ? 'text-white/90' : 'text-gray-700'}`} {...props} />,
                      li: ({node, ...props}) => <li className="text-sm" {...props} />,
                      code: ({node, inline, ...props}) => inline
                        ? <code className={`px-1.5 py-0.5 rounded text-xs font-mono ${isOwn ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`} {...props} />
                        : <pre className={`p-2 rounded text-xs overflow-auto my-2 ${isOwn ? 'bg-white/10' : 'bg-gray-100'}`} {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className={`border-l-2 pl-2 italic text-xs my-2 ${isOwn ? 'border-white/30 text-white/80' : 'border-gray-300 text-gray-600'}`} {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className={isOwn ? 'text-white/90' : 'text-gray-600'}>{message.content}</p>
              )
            )}

            {/* Like button overlay */}
            {!isAI && !isSystem && (
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Reaction clicked for message:', message._id);
                  onReaction(message._id, '❤️');
                }}
                className={`absolute -bottom-2 ${isOwn ? '-left-2' : '-right-2'} p-1.5 rounded-full shadow-md border transition-all active:scale-90 opacity-100 bg-white cursor-pointer z-20 ${hasLiked ? 'text-red-500 border-red-200' : 'text-gray-400 border-gray-100 hover:text-red-500'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-red-500 text-red-500' : 'text-current'}`} />
              </div>
            )}
          </div>

          {/* Reaction badges */}
          {reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className="bg-white border border-gray-100 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <span className="text-xs">❤️</span>
                <span className="text-[10px] font-bold text-gray-500">{reactions.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
