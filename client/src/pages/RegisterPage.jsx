import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../features/auth/authSlice';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const GREEN = '#388250';

const RegisterPage = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      console.error(message);
    }

    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { name, email, password };
    dispatch(register(userData));
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center relative py-12">
      {/* Content Container */}
      <div className="w-full px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex flex-col justify-center"
          >
            <div className="mb-12">
              <div
                className="w-12 h-12 rounded text-2xl font-bold flex items-center justify-center mb-4"
                style={{ background: GREEN, color: '#fff' }}
              >
                📖
              </div>
              <h1 className="text-5xl font-black leading-tight mb-6" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                Join Our <span style={{ color: GREEN }}>Community</span>
              </h1>
              <p
                className="text-lg leading-relaxed mb-12"
                style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }}
              >
                Start your learning journey today. Connect with peers, share knowledge, and achieve academic success together.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              {[
                { title: '✓ Free Forever', desc: 'No credit card required, ever' },
                { title: '✓ 100% Secure', desc: 'Your data is encrypted and protected' },
                { title: '✓ Instant Access', desc: 'Start collaborating in seconds' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <div style={{ color: GREEN }} className="text-2xl flex-shrink-0">→</div>
                  <div>
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }} className="text-sm">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div
              className="p-8 md:p-12 rounded-3xl border relative"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Header */}
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black mb-3" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Create Account
                </h2>
                <p style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }}>
                  Join StudySync and start learning together
                </p>
              </div>

              {/* Error Message */}
              {isError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl border"
                  style={{
                    background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                    borderColor: 'rgb(239, 68, 68)',
                    color: 'rgb(220, 38, 38)'
                  }}
                >
                  <p className="text-sm font-medium">{message}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Full Name Field */}
                <div>
                  <label className="text-sm font-semibold mb-3 block" style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}>
                    Full Name
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                      style={{
                        color: isDark ? 'rgba(242,242,242,0.25)' : 'rgba(12,12,12,0.3)'
                      }}
                    />
                    <input
                      type="text"
                      name="name"
                      value={name}
                      placeholder="John Doe"
                      onChange={onChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all outline-none"
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
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="text-sm font-semibold mb-3 block" style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}>
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                      style={{
                        color: isDark ? 'rgba(242,242,242,0.25)' : 'rgba(12,12,12,0.3)'
                      }}
                    />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      placeholder="your@email.com"
                      onChange={onChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all outline-none"
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
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="text-sm font-semibold mb-3 block" style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}>
                    Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                      style={{
                        color: isDark ? 'rgba(242,242,242,0.25)' : 'rgba(12,12,12,0.3)'
                      }}
                    />
                    <input
                      type="password"
                      name="password"
                      value={password}
                      placeholder="••••••••"
                      onChange={onChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all outline-none"
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
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2 mt-8"
                  style={{
                    background: GREEN,
                    boxShadow: `0 0 24px ${GREEN}40`,
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center pt-8 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
                <p style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }} className="text-sm">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-bold transition-colors"
                    style={{ color: GREEN }}
                  >
                    Sign in instead
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
