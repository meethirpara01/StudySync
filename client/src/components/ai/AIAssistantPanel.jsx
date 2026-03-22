import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { askAI, reset } from '../../features/ai/aiSlice';
import { Sparkles, Send, Loader2, BookOpen, Wand2, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '../../context/ThemeContext';

const AIAssistantPanel = ({ groupId }) => {
  const { isDark } = useTheme();
  const [prompt, setPrompt] = useState('');
  const dispatch = useDispatch();
  const { aiResponses, isLoading, isError, message } = useSelector((state) => state.ai);
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiResponses]);

  const onAsk = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    dispatch(askAI({ prompt, context: `Study group ${groupId}` }));
    setPrompt('');
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} relative overflow-hidden`}>
      {/* AI Header */}
      <div className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 border-b ${isDark ? 'border-gray-700 bg-[#0F0F0F]' : 'border-gray-100 bg-white'} flex items-center justify-between sticky top-0 z-10 shadow-sm/50 backdrop-blur-md`}>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
          <div className={`${isDark ? 'bg-amber-900/40' : 'bg-amber-50'} p-2 sm:p-2.5 rounded-lg text-amber-500 flex-shrink-0`}>
            <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>AI Study Assistant</h3>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1.5 mt-0.5 truncate`}>
              <Zap className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
              <span className="truncate">Mistral AI</span>
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 sm:gap-2 ${isDark ? 'bg-emerald-900/40' : 'bg-emerald-50'} px-2 sm:px-3 py-1.5 rounded-lg ${isDark ? 'text-emerald-300' : 'text-emerald-700'} font-semibold text-xs sm:text-xs border ${isDark ? 'border-emerald-800/60' : 'border-emerald-200'} flex-shrink-0`}>
          <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">Verified</span>
        </div>
      </div>

      {/* Responses Area */}
      <div className={`flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 space-y-3 sm:space-y-4 md:space-y-5 scrollbar-thin ${isDark ? 'scrollbar-thumb-gray-700' : 'scrollbar-thumb-gray-200'} scrollbar-track-transparent`}>
        {aiResponses.length > 0 ? (
          <AnimatePresence mode="popLayout" initial={false}>
            {aiResponses.map((res, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${res.type === 'user' ? 'items-end' : 'items-start'} space-y-3`}
              >
                {res.type === 'user' ? (
                  // USER MESSAGE
                  <div className="flex items-end gap-4 max-w-2xl">
                    <div className="bg-blue-500 text-white px-6 py-3 rounded-[2rem] rounded-br-none border border-blue-600 shadow-md">
                      <p className="text-white leading-relaxed font-medium">{res.content}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black shadow-sm flex-shrink-0">
                      <span className="text-lg">👤</span>
                    </div>
                  </div>
                ) : (
                  // AI RESPONSE
                  <div className="flex items-start gap-4 max-w-3xl w-full">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-sm flex-shrink-0 mt-1">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className={`p-6 rounded-[2rem] rounded-tl-none border shadow-sm/50 w-full ${isDark ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}`}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className={`text-xl font-black ${isDark ? 'text-black' : 'text-gray-900'} mb-3 mt-4 first:mt-0`} {...props} />,
                          h2: ({node, ...props}) => <h2 className={`text-lg font-black ${isDark ? 'text-black' : 'text-gray-900'} mb-2 mt-3`} {...props} />,
                          h3: ({node, ...props}) => <h3 className={`text-base font-bold ${isDark ? 'text-gray-900' : 'text-gray-800'} mb-2 mt-2`} {...props} />,
                          p: ({node, ...props}) => <p className={`${isDark ? 'text-black' : 'text-gray-800'} mb-3 leading-relaxed`} {...props} />,
                          ul: ({node, ...props}) => <ul className={`list-disc list-inside space-y-2 mb-3 ${isDark ? 'text-black' : 'text-gray-800'}`} {...props} />,
                          ol: ({node, ...props}) => <ol className={`list-decimal list-inside space-y-2 mb-3 ${isDark ? 'text-black' : 'text-gray-800'}`} {...props} />,
                          li: ({node, ...props}) => <li className={isDark ? 'text-black' : 'text-gray-800'} {...props} />,
                          code: ({node, inline, ...props}) => inline 
                            ? <code className={`${isDark ? 'bg-gray-100 text-blue-600' : 'bg-white text-amber-600'} px-2 py-1 rounded font-bold text-sm`} {...props} />
                            : <code className={`block ${isDark ? 'bg-gray-100 border-gray-300 text-black' : 'bg-white border-gray-200 text-gray-800'} p-3 rounded border overflow-x-auto text-sm font-mono my-3`} {...props} />,
                          pre: ({node, ...props}) => <pre className={`${isDark ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'} p-3 rounded border overflow-x-auto my-3`} {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className={`border-l-4 border-amber-500 pl-4 italic ${isDark ? 'text-gray-700' : 'text-gray-700'} my-3`} {...props} />,
                          table: ({node, ...props}) => <table className={`w-full border-collapse border ${isDark ? 'border-gray-300' : 'border-gray-200'} my-3 text-sm`} {...props} />,
                          th: ({node, ...props}) => <th className={`border p-2 font-bold text-left ${isDark ? 'border-gray-300 bg-gray-200 text-black' : 'border-gray-200 bg-gray-100 text-gray-900'}`} {...props} />,
                          td: ({node, ...props}) => <td className={`border p-2 ${isDark ? 'border-gray-300 text-black' : 'border-gray-200 text-gray-800'}`} {...props} />,
                        }}
                      >
                        {res.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 max-w-sm mx-auto">
            <div className="relative">
              <div className="absolute -inset-4 bg-amber-100/50 rounded-full blur-2xl animate-pulse" />
              <div className={`relative ${isDark ? 'bg-amber-900/30' : 'bg-amber-50'} p-8 rounded-[3rem] text-amber-400 shadow-xl shadow-amber-500/10`}>
                <Sparkles className="w-16 h-16" />
              </div>
            </div>
            <div>
              <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Need Help Studying?</h4>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} font-medium leading-relaxed mb-6`}>Ask me anything about your current subject. I can explain concepts, summarize topics, or generate practice quizzes!</p>
              <div className="grid grid-cols-2 gap-3">
                <button className={`${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-white hover:border-amber-200'} p-4 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all active:scale-95 shadow-sm`}>"Explain Quantum Physics"</button>
                <button className={`${isDark ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-white hover:border-amber-200'} p-4 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all active:scale-95 shadow-sm`}>"Summarize these notes"</button>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 max-w-2xl"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-full border border-gray-100 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Generating Insight...</span>
            </div>
          </motion.div>
        )}
        
        {isError && (
          <div className={`${isDark ? 'bg-red-900/30 border-red-800/50 text-red-400' : 'bg-red-50 border-red-100 text-red-600'} border p-6 rounded-3xl flex items-center gap-4 max-w-2xl mx-auto shadow-sm`}>
            <AlertCircle className="w-8 h-8" />
            <div>
              <p className="font-black text-sm uppercase tracking-widest mb-1">Error Encountered</p>
              <p className="font-bold text-lg">{message}</p>
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* AI Input Area */}
      <div className={`p-4 sm:p-5 md:p-6 border-t ${isDark ? 'border-gray-700 bg-[#0F0F0F]' : 'border-gray-100 bg-white'}`}>
        <form onSubmit={onAsk} className={`relative flex items-center gap-2 sm:gap-3 ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-gray-50 border-gray-200'} p-2 sm:p-3 rounded-lg md:rounded-2xl border focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/30 transition-all`}>
          <div className={`${isDark ? 'bg-amber-900/40' : 'bg-amber-50'} p-2 rounded-lg text-amber-500 flex-shrink-0`}>
            <Wand2 className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI..."
            className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 ${isDark ? 'text-white' : 'text-gray-900'} font-medium py-2 sm:py-3 text-sm ${isDark ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'}`}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white p-2 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
