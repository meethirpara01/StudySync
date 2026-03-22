import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import socket from '../../sockets/socketClient';
import aiService from '../../services/aiService';
import { FileText, Save, Share2, History, Loader2, Wand2, ShieldCheck, Sparkles, X, Clock, User, Copy, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownIt from 'markdown-it';
import { useTheme } from '../../context/ThemeContext';

const NotesEditor = ({ groupId }) => {
  const { isDark } = useTheme();
  const { currentGroup } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);
  const [content, setContent] = useState(currentGroup?.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [noteHistory, setNoteHistory] = useState([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);
  const quillRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleConnect = () => {
      socket.emit('join_notes', groupId);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on('connect', handleConnect);
    }

    // Listen for note updates
    socket.on('note_update', (newContent) => {
      setContent(newContent);
    });

    socket.on('note_history_update', (history) => {
      console.log('Received history update:', history);
      setNoteHistory(history || []);
    });

    // Request history if we have a current group
    if (currentGroup?.noteHistory) {
      setNoteHistory(currentGroup.noteHistory);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('note_update');
      socket.off('note_history_update');
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [groupId, currentGroup]);

  const handleChange = (content, delta, source, editor) => {
    // We update local state regardless of source to keep editor in sync
    setContent(content);

    // Only broadcast if the change was made by the user
    // We also check if content is different from state to avoid redundant emits
    if (source === 'user') {
      // Clear existing timer
      if (timerRef.current) clearTimeout(timerRef.current);

      setIsSaving(true);

      // Set new timer for auto-save (debounce)
      timerRef.current = setTimeout(() => {
        console.log('Emitting update_note:', { groupId, content });
        socket.emit('update_note', { groupId, content, userId: user._id });
        setIsSaving(false);
      }, 1500);
    }
  };

  const restoreVersion = (versionContent) => {
    setContent(versionContent);
    socket.emit('update_note', { groupId, content: versionContent, userId: user._id });
    setShowHistory(false);
  };

  const handleSummarize = async () => {
    if (!content || content.trim().length === 0) {
      setSummaryError('Please write some notes first');
      return;
    }

    try {
      setIsSummarizing(true);
      setSummaryError('');
      setSummary('');
      
      const result = await aiService.summarizeNotes({ notes: content });
      
      if (!result.success) {
        setSummaryError(result.message || 'Failed to summarize notes');
        return;
      }

      setSummary(result.summary);
      setShowSummary(true);
    } catch (error) {
      console.error('Error summarizing:', error);
      setSummaryError(error.message || 'Failed to summarize notes. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const insertSummaryIntoNotes = () => {
    try {
      // Convert markdown to HTML
      const md = new MarkdownIt();
      const htmlSummary = md.render(summary);
      
      // Create a nice separator and header
      const separator = '<p><br/></p><hr /><p><br/></p>';
      const header = '<h2 style="margin-top: 2rem; margin-bottom: 1rem;">📋 AI Generated Summary</h2>';
      
      // Combine with current content
      const updatedHtml = content + separator + header + htmlSummary;
      
      // Update the editor state - this will trigger onChange which handles socket emission
      setContent(updatedHtml);
      setShowSummary(false);
      
      // Also emit socket event immediately
      socket.emit('update_note', { groupId, content: updatedHtml, userId: user._id });
      
    } catch (error) {
      console.error('Error inserting summary:', error);
      setSummaryError('Failed to insert summary. Please try again.');
    }
  };

  const copySummaryToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'blockquote', 'code-block',
    'link', 'image',
  ];

  return (
    <div className={`flex flex-col h-full w-full ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} relative overflow-hidden p-0 min-h-0`}>
      {/* Editor Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-b ${isDark ? 'border-gray-700 bg-[#0F0F0F]' : 'border-gray-100 bg-white'} shadow-sm`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className={`${isDark ? 'bg-emerald-900/40' : 'bg-emerald-50'} p-2 sm:p-2.5 rounded-lg text-emerald-500 flex-shrink-0`}>
            <FileText className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>Shared Notes</h3>
            <div className="flex items-center gap-2 mt-0.5 min-w-0">
              <span className={`flex items-center gap-1 text-xs font-medium ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-600'} px-2 py-1 rounded border flex-shrink-0`}>
                <Share2 className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">Collaborative</span>
              </span>
              <AnimatePresence>
                {isSaving && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-center gap-1.5 text-xs font-bold ${isDark ? 'text-green-400 bg-green-900/30 border-green-800/50' : 'text-green-500 bg-green-50 border-green-100'} uppercase tracking-widest px-3 py-1 rounded-full border`}
                  >
                    <Save className="w-3 h-3 animate-pulse" />
                    Auto-saving
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistory(true)}
            className={`flex items-center gap-2 ${isDark ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'} border px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-sm`}
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </button>
          <button 
            onClick={handleSummarize}
            disabled={isSummarizing}
            className={`flex items-center gap-2 ${isDark ? 'bg-amber-900/40 text-amber-300 border-amber-800/50 hover:bg-amber-900/60' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'} border px-6 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSummarizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>AI Summarize</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className={`flex-1 ${isDark ? 'bg-[#0F0F0F] border-gray-700' : 'bg-white border-gray-100'} rounded-[3rem] border shadow-sm/50 overflow-hidden flex flex-col group relative min-h-0`}>
        <div className="absolute top-0 right-0 p-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-blue-50 px-4 py-2 rounded-xl text-primary font-bold text-xs border border-blue-100 flex items-center gap-2 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Cloud Sync Active</span>
          </div>
        </div>
        
        <div className={`flex-1 flex flex-col min-h-0 w-full overflow-scroll ${isDark ? 'dark-quill' : ''}`}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder="Start writing your shared study notes here..."
          />
        </div>
      </div>

      {/* History Sidebar/Overlay */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`absolute top-0 right-0 h-full w-full sm:w-80 max-w-xs ${isDark ? 'bg-[#1a1a1a] border-gray-700' : 'bg-white border-gray-100'} shadow-2xl z-50 border-l flex flex-col`}
            >
              <div className={`p-6 border-b ${isDark ? 'border-gray-700 bg-[#0F0F0F]' : 'border-gray-100'} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-600'} p-2 rounded-xl`}>
                    <History className="w-5 h-5" />
                  </div>
                  <h4 className={`font-black ${isDark ? 'text-white' : 'text-gray-900'} uppercase tracking-tight`}>Note History</h4>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {noteHistory.length > 0 ? (
                  [...noteHistory].reverse().map((version, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 rounded-2xl border ${isDark ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:shadow-lg' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md'} transition-all group cursor-pointer`}
                      onClick={() => restoreVersion(version.content)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {version.updatedBy?.name?.charAt(0) || <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{version.updatedBy?.name || 'Unknown'}</p>
                          <div className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-400'} font-bold uppercase`}>
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(version.updatedAt), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} line-clamp-2 font-medium italic`}>
                        "{version.content.replace(/<[^>]*>/g, '').substring(0, 100)}..."
                      </p>
                      <button className={`mt-3 w-full py-2 ${isDark ? 'bg-gray-800 text-emerald-400 border-emerald-800/50 hover:bg-emerald-600 hover:text-white' : 'bg-white text-primary border-primary/20 hover:bg-primary hover:text-white'} border rounded-xl text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity`}>
                        Restore This Version
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                    <div className="bg-gray-50 p-6 rounded-[2rem] text-gray-200">
                      <Clock className="w-12 h-12" />
                    </div>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No history recorded yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSummary(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-4xl max-h-[85vh] bg-white shadow-2xl z-50 border border-gray-200 rounded-3xl flex flex-col overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white sticky top-0">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg shadow-amber-500/30">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">AI-Generated Summary</h4>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Enhanced and formatted with markdown</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSummary(false)}
                  className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-8 text-gray-700">
                <div className="max-w-full">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-black text-gray-900 mb-4 mt-6 first:mt-0" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-black text-gray-900 mb-3 mt-5" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-800 mb-2 mt-4" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-700 mb-3 leading-relaxed text-base" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700 ml-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700 ml-2" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                      code: ({node, inline, ...props}) => inline 
                        ? <code className="bg-amber-50 px-2.5 py-1.5 rounded text-amber-700 font-mono font-semibold text-sm" {...props} />
                        : <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg border border-gray-700 overflow-x-auto my-4 font-mono text-sm leading-relaxed" {...props} />,
                      pre: ({node, ...props}) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg border border-gray-700 overflow-x-auto my-4" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-amber-500 pl-5 py-1 italic text-gray-600 my-4 bg-gray-50 rounded-r-lg pr-4" {...props} />,
                      table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-gray-300" {...props} /></div>,
                      th: ({node, ...props}) => <th className="border border-gray-300 p-3 bg-amber-50 font-bold text-gray-900 text-left" {...props} />,
                      td: ({node, ...props}) => <td className="border border-gray-300 p-3 text-gray-700" {...props} />,
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-gray-200 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white sticky bottom-0">
                <button
                  onClick={copySummaryToClipboard}
                  className="flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-5 h-5 text-green-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>
                <button
                  onClick={insertSummaryIntoNotes}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:from-amber-600 hover:to-amber-700 transition-all active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Insert into Notes</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Summary Error (Inline Alert) */}
      <AnimatePresence>
        {summaryError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg z-50"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold">{summaryError}</span>
            <button
              onClick={() => setSummaryError('')}
              className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* Light Mode (Default) */
        .ql-container.ql-snow {
          border: none !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 1rem !important;
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: 0 !important;
          height: 100% !important;
          max-height: 100% !important;
          color: #374151 !important;
          width: 100% !important;
        }
        
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding: 1.5rem 2rem !important;
          background: #ffffff !important;
          position: sticky !important;
          top: 0 !important;
          z-index: 10 !important;
          flex-shrink: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        .ql-editor {
          flex: 1 !important;
          min-height: 0 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          line-height: 1.8 !important;
          color: #374151 !important;
          padding: 2rem !important;
          width: 100% !important;
        }
        
        .ql-editor.ql-blank::before {
          color: #d1d5db !important;
          font-style: normal !important;
          font-weight: 500 !important;
        }
        
        .ql-snow .ql-stroke {
          stroke: #9ca3af !important;
          stroke-width: 2px !important;
        }
        
        .ql-snow .ql-fill {
          fill: #9ca3af !important;
        }
        
        .ql-snow .ql-picker {
          color: #9ca3af !important;
          font-weight: 600 !important;
        }
        
        .ql-snow.ql-toolbar button:hover .ql-stroke,
        .ql-snow.ql-toolbar button:hover .ql-fill {
          stroke: #3b82f6 !important;
          fill: #3b82f6 !important;
        }
        
        .ql-snow.ql-toolbar button.ql-active .ql-stroke,
        .ql-snow.ql-toolbar button.ql-active .ql-fill {
          stroke: #3b82f6 !important;
          fill: #3b82f6 !important;
        }

        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 1.5rem !important;
        }

        .ql-toolbar.ql-snow .ql-stroke {
          stroke: #d1d5db !important;
        }

        .ql-toolbar.ql-snow .ql-fill {
          fill: #d1d5db !important;
        }

        .ql-toolbar.ql-snow button.ql-active .ql-stroke {
          stroke: #3b82f6 !important;
        }

        .ql-toolbar.ql-snow button.ql-active .ql-fill {
          fill: #3b82f6 !important;
        }

        /* Dark Mode */
        .dark-quill .ql-container.ql-snow {
          background: #0f0f0f !important;
          color: #f3f4f6 !important;
          height: 100% !important;
          max-height: 100% !important;
          width: 100% !important;
        }

        .dark-quill .ql-toolbar.ql-snow {
          background: #1a1a1a !important;
          border-bottom-color: #404040 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }

        .dark-quill .ql-editor {
          background: #0f0f0f !important;
          color: #f3f4f6 !important;
          width: 100% !important;
        }

        .dark-quill .ql-editor.ql-blank::before {
          color: #6b7280 !important;
        }

        .dark-quill .ql-toolbar.ql-snow .ql-stroke {
          stroke: #9ca3af !important;
        }

        .dark-quill .ql-toolbar.ql-snow .ql-fill {
          fill: #9ca3af !important;
        }

        .dark-quill .ql-toolbar.ql-snow .ql-picker {
          color: #9ca3af !important;
        }

        .dark-quill .ql-toolbar.ql-snow button:hover .ql-stroke,
        .dark-quill .ql-toolbar.ql-snow button:hover .ql-fill,
        .dark-quill .ql-toolbar.ql-snow button.ql-active .ql-stroke,
        .dark-quill .ql-toolbar.ql-snow button.ql-active .ql-fill {
          stroke: #3b82f6 !important;
          fill: #3b82f6 !important;
        }

        .dark-quill .ql-snow.ql-toolbar button:hover .ql-stroke,
        .dark-quill .ql-snow.ql-toolbar button:hover .ql-fill {
          stroke: #3b82f6 !important;
          fill: #3b82f6 !important;
        }

        /* Scrollbar Styling */
        .ql-editor::-webkit-scrollbar {
          width: 8px;
        }

        .ql-editor::-webkit-scrollbar-track {
          background: transparent;
        }

        .ql-editor::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }

        .ql-editor::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .dark-quill .ql-editor::-webkit-scrollbar-thumb {
          background: #4b5563;
        }

        .dark-quill .ql-editor::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Firefox Scrollbar */
        .ql-editor {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }

        .dark-quill .ql-editor {
          scrollbar-color: #4b5563 transparent;
        }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 {
          color: #111827 !important;
          font-weight: 700 !important;
        }

        .dark-quill .ql-editor h1,
        .dark-quill .ql-editor h2,
        .dark-quill .ql-editor h3 {
          color: #f9fafb !important;
        }

        .ql-editor strong {
          font-weight: 700 !important;
        }

        .ql-editor code {
          background: #f3f4f6 !important;
          color: #374151 !important;
          padding: 0.25rem 0.5rem !important;
          border-radius: 0.25rem !important;
          font-family: 'Fira Code', monospace !important;
          font-size: 0.9em !important;
        }

        .dark-quill .ql-editor code {
          background: #1f2937 !important;
          color: #f3f4f6 !important;
        }

        .ql-editor pre {
          background: #1f2937 !important;
          color: #f9fafb !important;
        }

        .ql-editor blockquote {
          border-left: 4px solid #3b82f6 !important;
          margin: 1rem 0 !important;
          padding: 1rem 1.5rem !important;
          background: #f0f9ff !important;
          border-radius: 0.5rem !important;
        }

        .dark-quill .ql-editor blockquote {
          background: #1e3a8a !important;
          color: #e0f2fe !important;
        }

        .ql-container {
          display: flex !important;
          flex-direction: column !important;
          flex: 1 !important;
          min-height: 0 !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default NotesEditor;
