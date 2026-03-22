import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Button = ({ 
  variant = 'primary', 
  size = 'md',
  children, 
  className = '',
  ...props 
}) => {
  const { isDark } = useTheme();
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl',
    secondary: isDark ? 'bg-dark-tertiary text-white hover:bg-dark-secondary' : 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    ghost: isDark ? 'bg-transparent text-white hover:bg-dark-tertiary border border-dark-tertiary' : 'bg-transparent text-gray-900 hover:bg-gray-100 border border-gray-200',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Card = ({ children, className = '', hover = true, ...props }) => {
  const { isDark } = useTheme();
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.3 }}
      className={`${isDark ? 'bg-dark-secondary text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Input = ({ 
  placeholder = '', 
  type = 'text', 
  className = '',
  icon: Icon,
  ...props 
}) => {
  const { isDark } = useTheme();
  return (
    <div className="relative">
      {Icon && <Icon className={`absolute left-3 top-3.5 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 rounded-lg border ${isDark ? 'bg-dark-tertiary border-dark-tertiary text-white placeholder-gray-500 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20'} outline-none transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

export const Badge = ({ 
  variant = 'default', 
  children, 
  className = '',
  ...props 
}) => {
  const { isDark } = useTheme();
  
  const variants = {
    default: isDark ? 'bg-dark-tertiary text-white' : 'bg-gray-100 text-gray-800',
    primary: 'bg-primary bg-opacity-10 text-primary',
    success: isDark ? 'bg-green-900 bg-opacity-30 text-green-300' : 'bg-green-100 text-green-800',
    warning: isDark ? 'bg-yellow-900 bg-opacity-30 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
    danger: isDark ? 'bg-red-900 bg-opacity-30 text-red-300' : 'bg-red-100 text-red-800',
    info: isDark ? 'bg-blue-900 bg-opacity-30 text-blue-300' : 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} ${className}`}
    >
      <Loader2 className={`w-full h-full text-primary`} />
    </motion.div>
  );
};

export const ChatBubble = ({ 
  author = 'ai', 
  message, 
  timestamp,
  className = '',
  ...props 
}) => {
  const { isDark } = useTheme();
  const isUser = author === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}
      {...props}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-primary text-white rounded-br-none'
            : isDark ? 'bg-dark-tertiary text-white rounded-bl-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        <p className="text-sm md:text-base break-words">{message}</p>
        {timestamp && (
          <p className={`text-xs mt-1 ${isUser ? 'text-white text-opacity-70' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors ${
        isDark 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      } ${className}`}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </motion.button>
  );
};

export default {
  Button,
  Card,
  Input,
  Badge,
  Loader,
  ChatBubble,
  ThemeToggle,
};
