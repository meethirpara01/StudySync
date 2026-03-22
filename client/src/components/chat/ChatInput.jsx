import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Smile, Paperclip, Loader2, Sparkles, Wand2, Link as LinkIcon, X } from 'lucide-react';
import socket from '../../sockets/socketClient';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';

const ChatInput = ({ groupId }) => {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { group: groupId, userName: user.name });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { group: groupId });
    }, 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Automatically add a mention of the file in the text area
      setContent((prev) => prev + ` [File: ${file.name}] `);
    }
    // Clear input value so same file can be selected again
    e.target.value = '';
  };

  const onSend = (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile && !linkUrl.trim()) return;

    let finalContent = content.trim();
    if (showLinkInput && linkUrl.trim()) {
      finalContent = `${linkUrl.trim()} ${content.trim()}`.trim();
    }

    const sendMessageData = (fileData = null) => {
      const messageData = {
        group: groupId,
        sender: user._id,
        content: finalContent,
        type: selectedFile ? 'file' : showLinkInput ? 'link' : 'text',
      };

      if (selectedFile) {
        messageData.fileName = selectedFile.name;
        messageData.fileSize = selectedFile.size;
        messageData.fileData = fileData; // This will be the base64 string
      }

      socket.emit('send_message', messageData);

      setContent('');
      setSelectedFile(null);
      setLinkUrl('');
      setShowLinkInput(false);
      setIsTyping(false);
      setShowEmojiPicker(false);
      socket.emit('stop_typing', { group: groupId });
    };

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        sendMessageData(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      sendMessageData();
    }
  };

  const onEmojiClick = (emojiObject) => {
    setContent((prev) => prev + emojiObject.emoji);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Trigger submission manually to bypass any button-state lag
      let finalContent = content.trim();
      if (showLinkInput && linkUrl.trim()) {
        finalContent = `${linkUrl.trim()} ${content.trim()}`.trim();
      }

      const sendMessageData = (fileData = null) => {
        const messageData = {
          group: groupId,
          sender: user._id,
          content: finalContent,
          type: selectedFile ? 'file' : showLinkInput ? 'link' : 'text',
        };

        if (selectedFile) {
          messageData.fileName = selectedFile.name;
          messageData.fileSize = selectedFile.size;
          messageData.fileData = fileData;
        }

        // Check if there is actually anything to send
        if (messageData.content || selectedFile) {
          socket.emit('send_message', messageData);

          // Reset all states
          setContent('');
          setSelectedFile(null);
          setLinkUrl('');
          setShowLinkInput(false);
          setIsTyping(false);
          setShowEmojiPicker(false);
          socket.emit('stop_typing', { group: groupId });
        }
      };

      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          sendMessageData(event.target.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        sendMessageData();
      }
    }
  };

  return (
    <div className="relative group">
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-24 left-0 z-50 shadow-2xl rounded-3xl overflow-hidden"
            ref={emojiPickerRef}
          >
            <EmojiPicker 
              onEmojiClick={onEmojiClick}
              autoFocusSearch={false}
              theme="light"
              searchPlaceholder="Search emoji..."
              width={350}
              height={400}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSend} className="relative z-10 flex items-center gap-4 bg-gray-50/80 p-4 rounded-[2.5rem] border border-gray-100 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50 transition-all backdrop-blur-sm group-hover:bg-white shadow-sm hover:shadow-md">
        <div className="flex items-center gap-2 pl-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className={`p-3 rounded-2xl transition-all active:scale-95 shadow-sm/0 hover:shadow-sm ${selectedFile ? 'text-primary bg-white shadow-sm' : 'text-gray-400 hover:text-primary hover:bg-white'}`}
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowLinkInput(!showLinkInput);
              if (!showLinkInput) setLinkUrl('');
            }}
            className={`p-3 rounded-2xl transition-all active:scale-95 shadow-sm/0 hover:shadow-sm ${showLinkInput ? 'text-blue-500 bg-white shadow-sm' : 'text-gray-400 hover:text-blue-500 hover:bg-white'}`}
            title="Share link"
          >
            <LinkIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 rounded-2xl transition-all active:scale-95 shadow-sm/0 hover:shadow-sm ${showEmojiPicker ? 'text-amber-500 bg-white shadow-sm' : 'text-gray-400 hover:text-amber-500 hover:bg-white'}`}
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <AnimatePresence>
            {showLinkInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-xl border border-blue-100 mb-1">
                  <LinkIcon className="w-4 h-4 text-blue-400" />
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Paste your study resource link here..."
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-blue-600 placeholder:text-blue-300"
                    autoFocus
                  />
                  <button onClick={() => setShowLinkInput(false)} className="text-gray-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="text"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={onKeyDown}
            placeholder={showLinkInput ? "Add a description for your link (optional)..." : "Message this study group..."}
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 font-medium py-3 placeholder:text-gray-400 placeholder:font-bold"
          />
        </div>

        <div className="flex items-center gap-3 pr-2">
          <button
            type="button"
            className="hidden md:flex items-center gap-2 bg-white text-primary border border-primary/20 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Refine</span>
          </button>
          <button
            type="submit"
            disabled={!content.trim() && !selectedFile && !linkUrl.trim()}
            className="bg-gray-900 text-white p-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
      
      {/* Visual background decoration */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-[3rem] opacity-0 group-hover:opacity-100 blur-xl transition-opacity pointer-events-none" />
    </div>
  );
};

export default ChatInput;
