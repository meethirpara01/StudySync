import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';


const GREEN = '#388250';
const GREEN_LIGHT = '#4a9f66';
const GREEN_DIM = '#2d6941';

// CSS-in-JS styles
const styles = `
  @keyframes drift1 {
    0%,100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(-40px); }
  }
  @keyframes drift2 {
    0%,100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(8deg); }
  }
  @keyframes tick {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-item { flex-shrink: 0; }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes underlineHover {
    from { width: 0%; }
    to { width: 100%; }
  }
  .rv { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .rv.in { opacity: 1; transform: none; }
  .rv.d1 { transition-delay: 0.08s; }
  .rv.d2 { transition-delay: 0.16s; }
  .rv.d3 { transition-delay: 0.24s; }
  .rv.d4 { transition-delay: 0.32s; }
  .cur-dot { will-change: left, top; }
  .cur-dot.big { width: 16px; height: 16px; }
  .cur-ring { will-change: left, top; }
  .cur-ring.big { width: 52px; height: 52px; border-color: ${GREEN}; }
  .nav-link {
    position: relative;
    display: inline-block;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${GREEN};
    transition: width 0.3s ease;
  }
  .nav-link:hover::after {
    width: 100%;
  }
  body { cursor: none; }
  
  /* Responsive Marquee */
  @media (max-width: 768px) {
    .marquee-item {
      gap: 8px !important;
      padding-left: 12px !important;
      padding-right: 12px !important;
    }
    .marquee-item span:first-child {
      font-size: 24px !important;
    }
    .marquee-item span:last-child {
      font-size: 14px !important;
    }
  }
  
  @media (max-width: 480px) {
    .marquee-item {
      gap: 6px !important;
      padding-left: 10px !important;
      padding-right: 10px !important;
    }
    .marquee-item span:first-child {
      font-size: 20px !important;
    }
    .marquee-item span:last-child {
      font-size: 12px !important;
    }
  }
  
  /* Responsive Navbar */
  @media (max-width: 768px) {
    .nav-container {
      gap: 8px !important;
    }
    .nav-links {
      gap: 6px !important;
      margin-left: 8px !important;
    }
  }
`;


const HomePage = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [wordmarkIn, setWordmarkIn] = useState(false);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const [navPadding, setNavPadding] = useState('18px 52px');

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  // Cursor tracking with smooth animation
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;
    let animationId = null;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animateCursor = () => {
      // Smooth easing for dot movement
      dotX += (mouseX - dotX) * 0.8;
      dotY += (mouseY - dotY) * 0.8;

      // Slower easing for ring (creates trailing effect)
      ringX += (mouseX - ringX) * 0.3;
      ringY += (mouseY - ringY) * 0.3;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = dotX + 'px';
        cursorDotRef.current.style.top = dotY + 'px';
      }

      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = ringX + 'px';
        cursorRingRef.current.style.top = ringY + 'px';
      }

      animationId = requestAnimationFrame(animateCursor);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationId = requestAnimationFrame(animateCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Cursor scale on hover
  useEffect(() => {
    const handleMouseEnter = () => {
      if (cursorDotRef.current) cursorDotRef.current.classList.add('big');
      if (cursorRingRef.current) cursorRingRef.current.classList.add('big');
    };
    const handleMouseLeave = () => {
      if (cursorDotRef.current) cursorDotRef.current.classList.remove('big');
      if (cursorRingRef.current) cursorRingRef.current.classList.remove('big');
    };

    const interactive = document.querySelectorAll('a, button, [role="button"]');
    interactive.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      interactive.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  // Nav shrink on scroll
  useEffect(() => {
    const handleScroll = () => {
      setNavPadding(window.scrollY > 50 ? '12px 52px' : '18px 52px');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.rv').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Card glow follow
  useEffect(() => {
    document.querySelectorAll('.fc').forEach((c) => {
      c.addEventListener('mousemove', (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }, []);

  // Giant wordmark reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setWordmarkIn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    const gw = document.getElementById('giant-word');
    if (gw) observer.observe(gw);
    return () => observer.disconnect();
  }, []);

  // Theme toggle - ensure smooth update
  useEffect(() => {
    // Trigger style recalculation without remounting
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    
    // Force wordmark to recalculate background-clip with new theme gradient
    if (wordmarkIn) {
      const giantWord = document.getElementById('giant-word');
      if (giantWord) {
        // Force reflow to recalculate WebkitBackgroundClip and WebkitTextFillColor
        giantWord.style.display = 'none';
        // eslint-disable-next-line no-unused-expressions
        giantWord.offsetHeight; // Trigger reflow
        giantWord.style.display = '';
      }
    }
  }, [isDark, wordmarkIn]);


  const theme = isDark ? 'dark' : 'light';
  const bgClass = isDark ? 'bg-[#0C0C0C]' : 'bg-[#F5F7F5]';
  const textClass = isDark ? 'text-[#F2F2F2]' : 'text-[#0C0C0C]';

  return (
    <div 
      className={`${bgClass} ${textClass} overflow-x-hidden w-full`}
      style={{ cursor: 'none' }}
      data-theme={theme}
    >
      <style>{styles}</style>

      {/* Custom Cursor */}
      <div
        ref={cursorDotRef}
        className="cur-dot pointer-events-none fixed w-2 h-2 rounded-full z-[9999]"
        style={{
          background: GREEN,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s ease-out, height 0.2s ease-out, box-shadow 0.2s',
          boxShadow: `0 0 20px ${GREEN}`
        }}
      />
      <div
        ref={cursorRingRef}
        className="cur-ring pointer-events-none fixed w-8 h-8 rounded-full z-[9998]"
        style={{
          border: `1.5px solid rgba(56,130,80,0.45)`,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.2s ease-out, height 0.2s ease-out, border-color 0.2s'
        }}
      />

      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[8000]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E")`,
          opacity: 0.55
        }}
      />

      {/* NAV */}
      <nav
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between backdrop-blur-[24px] bg-opacity-75 transition-all duration-300 border-b border-opacity-10 w-full nav-container"
        style={{
          padding: window.innerWidth < 768 ? '14px 24px' : navPadding,
          background: isDark ? 'rgba(12,12,12,0.75)' : 'rgba(245,247,245,0.82)',
          borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          boxSizing: 'border-box',
          left: 0,
          right: 0
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline transition-all hover:scale-105">
          <div
            className="w-8 h-8 rounded text-lg font-bold flex items-center justify-center flex-shrink-0"
            style={{ 
              background: GREEN,
              boxShadow: `0 4px 14px rgba(56,130,80,0.35)`,
              fontFamily: "'Clash Display', sans-serif"
            }}
          >
            📖
          </div>
          <span className="text-base font-bold hidden sm:inline" style={{ fontFamily: "'Clash Display', sans-serif" }}>
            StudySync
          </span>
        </Link>

        {/* Links */}
        <ul className="hidden md:flex gap-8 list-none ml-12 flex-1 nav-links">
          {['Features', 'How-it-works', 'Stories', 'Pricing'].map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase()}`}
                className="nav-link text-base font-medium transition-colors no-underline"
                style={{
                  color: isDark ? 'rgba(242,242,242,0.6)' : 'rgba(12,12,12,0.6)',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = GREEN;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = isDark ? 'rgba(242,242,242,0.6)' : 'rgba(12,12,12,0.6)';
                }}
              >
                {link.replace('-', ' ')}
              </a>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
            style={{
              background: isDark ? 'rgba(56,130,80,0.15)' : 'rgba(56,130,80,0.1)',
              border: `1.5px solid ${isDark ? 'rgba(56,130,80,0.4)' : 'rgba(56,130,80,0.3)'}`,
              boxShadow: `0 0 0 2px ${isDark ? 'rgba(56,130,80,0)' : 'rgba(56,130,80,0)'}`
            }}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              {isDark ? (
                <Moon
                  size={18}
                  style={{
                    color: GREEN,
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: 'rotate(0deg)',
                    opacity: 1
                  }}
                  className="absolute"
                />
              ) : (
                <Sun
                  size={18}
                  style={{
                    color: GREEN,
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: 'rotate(0deg)',
                    opacity: 1
                  }}
                  className="absolute"
                />
              )}
            </div>
            
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle, ${GREEN}20 0%, transparent 70%)`,
                pointerEvents: 'none'
              }}
            />
          </button>

          {user ? (
            <>
              {/* Dashboard Link */}
              <Link to="/dashboard">
                <button
                  className="px-5 py-2 text-base font-medium rounded border transition-all hover:scale-105 hidden sm:block"
                  style={{
                    background: 'none',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                    color: isDark ? '#F2F2F2' : '#0C0C0C'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = GREEN;
                    e.currentTarget.style.color = GREEN;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
                    e.currentTarget.style.color = isDark ? '#F2F2F2' : '#0C0C0C';
                  }}
                >
                  Dashboard
                </button>
              </Link>

              {/* Profile & Username */}
              <div
                className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg"
                style={{
                  background: isDark ? 'rgba(56,130,80,0.1)' : 'rgba(56,130,80,0.08)'
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: GREEN }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: isDark ? '#F2F2F2' : '#0C0C0C' }}
                >
                  {user.name}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-base font-medium rounded border transition-all hover:scale-105 hidden sm:flex items-center gap-2"
                style={{
                  background: isDark ? 'rgba(56,130,80,0.1)' : 'rgba(56,130,80,0.08)',
                  border: `1px solid ${isDark ? 'rgba(56,130,80,0.3)' : 'rgba(56,130,80,0.2)'}`,
                  color: GREEN
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 12px rgba(56,130,80, 0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Sign In */}
              <Link to="/login">
                <button
                  className="px-5 py-2 text-base font-medium rounded border transition-all hover:scale-105 hidden sm:block"
                  style={{
                    background: 'none',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                    color: isDark ? '#F2F2F2' : '#0C0C0C'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = GREEN;
                    e.currentTarget.style.color = GREEN;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
                    e.currentTarget.style.color = isDark ? '#F2F2F2' : '#0C0C0C';
                  }}
                >
                  Sign In
                </button>
              </Link>

              {/* Get Started */}
              <Link to="/register">
                <button
                  className="px-6 py-2 text-base font-bold rounded transition-all text-white hover:scale-105"
                  style={{
                    background: GREEN,
                    boxShadow: `0 4px 18px rgba(56,130,80,0.3)`,
                    letterSpacing: '-0.01em',
                    fontFamily: "'Clash Display', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 32px rgba(56,130,80,0.5)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 18px rgba(56,130,80,0.3)`;
                  }}
                >
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-6 pt-24 overflow-hidden w-full box-border">
        {/* Orbs */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[90px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse, rgba(56,130,80,0.1) 0%, transparent 70%)`,
            animation: 'drift1 10s ease-in-out infinite'
          }}
        />
        <div
          className="absolute bottom-20 right-0 w-96 h-96 rounded-full blur-[90px] pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(56,130,80,0.07) 0%, transparent 70%)`,
            animation: 'drift2 13s ease-in-out infinite'
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} 1px, transparent 1px),
                             linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'} 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, transparent 30%, black 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="rv inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border font-bold uppercase tracking-wider"
            style={{
              fontSize: '15px',
              background: isDark ? 'rgba(56,130,80,0.12)' : 'rgba(56,130,80,0.1)',
              borderColor: 'rgba(56,130,80,0.22)',
              color: GREEN
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: GREEN }}
            />
            AI-Powered Collaborative Learning
          </div>

          {/* Headline */}
          <h1
            className="rv d1 font-black leading-tight tracking-tight mb-7"
            style={{
              fontSize: 'clamp(64px, 10vw, 128px)',
              fontFamily: "'Clash Display', sans-serif",
              letterSpacing: '-0.035em',
              lineHeight: '0.96'
            }}
          >
            Study Smarter,
            <br />
            <span style={{ color: GREEN, position: 'relative', display: 'inline-block' }}>
              Together.
              <span
                className="absolute -inset-1 rounded"
                style={{
                  background: isDark ? 'rgba(56,130,80,0.18)' : 'rgba(56,130,80,0.1)',
                  zIndex: -1
                }}
              />
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="rv d2 mb-11 max-w-2xl mx-auto"
            style={{
              fontSize: 'clamp(18px, 2.2vw, 22px)',
              color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)',
              fontWeight: 300,
              lineHeight: '1.7'
            }}
          >
            StudySync unites students in a live, AI-enhanced workspace. Notes, chat, and intelligence — all in one place.
          </p>

          {/* Buttons */}
          <div className="rv d3 flex gap-3 justify-center flex-wrap mb-14">
            <Link to="/register">
              <button
                className="px-8 py-4 rounded-2xl font-bold text-white flex items-center gap-2 transition-all hover:scale-[1.02] hover:-translate-y-0.5"
                style={{
                  background: GREEN,
                  fontSize: '16px',
                  fontFamily: "'Clash Display', sans-serif",
                  letterSpacing: '-0.01em',
                  boxShadow: `0 6px 28px rgba(56,130,80,0.35)`
                }}
              >
                Get Started Free <span>→</span>
              </button>
            </Link>
            <a
              href="#features"
              className="px-7 py-4 rounded-2xl transition-all border flex items-center gap-2"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                color: isDark ? '#F2F2F2' : '#0C0C0C',
                fontSize: '15px',
                fontWeight: 500
              }}
            >
              ▶ See how it works
            </a>
          </div>

          {/* Trust Pills */}
          <div className="rv d4 flex gap-2 justify-center flex-wrap">
            {['Free forever', '100% Secure', 'No credit card', '24/7 Support'].map((pill) => (
              <div
                key={pill}
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all hover:bg-opacity-20"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                  color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)'
                }}
              >
                <span style={{ color: GREEN, fontWeight: 700 }}>✓</span> {pill}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div
        className="overflow-hidden w-full box-border"
        style={{
          padding: window.innerWidth < 768 ? '18px 0' : window.innerWidth < 480 ? '14px 0' : '36px 0',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
          background: isDark ? '#111111' : '#ECEEED'
        }}
      >
        <div
          className="flex gap-0 hover:pause"
          style={{ animation: window.innerWidth < 768 ? 'tick 14s linear infinite' : 'tick 18s linear infinite' }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
        >
          {/* Render items twice for seamless infinite loop */}
          {[
            { num: '250K+', label: 'Students' },
            { num: '18K+', label: 'Study Groups' },
            { num: '4.9 ★', label: 'App Rating' },
            { num: '92%', label: 'Grade Improvement' },
            { num: '140+', label: 'Universities' },
            { num: '2M+', label: 'Notes Shared' }
          ]
            .concat([
              { num: '250K+', label: 'Students' },
              { num: '18K+', label: 'Study Groups' },
              { num: '4.9 ★', label: 'App Rating' },
              { num: '92%', label: 'Grade Improvement' },
              { num: '140+', label: 'Universities' },
              { num: '2M+', label: 'Notes Shared' }
            ])
            .map((item, i) => {
              const isMobile = window.innerWidth < 768;
              const isSmallMobile = window.innerWidth < 480;
              return (
                <div
                  key={i}
                  className="marquee-item flex items-center whitespace-nowrap"
                  style={{
                    gap: isSmallMobile ? '6px' : isMobile ? '8px' : '18px',
                    paddingLeft: isSmallMobile ? '10px' : isMobile ? '12px' : '16px',
                    paddingRight: isSmallMobile ? '10px' : isMobile ? '12px' : '16px',
                    borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`
                  }}
                >
                  <span
                    style={{
                      fontSize: isSmallMobile ? '20px' : isMobile ? '24px' : '32px',
                      fontWeight: 700,
                      color: GREEN,
                      fontFamily: "'Clash Display', sans-serif"
                    }}
                  >
                    {item.num}
                  </span>
                  <span style={{
                    fontSize: isSmallMobile ? '12px' : isMobile ? '14px' : '18px',
                    color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)',
                    letterSpacing: '0.04em'
                  }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* FEATURES */}
      <FeaturesSection isDark={isDark} />

      {/* HOW IT WORKS */}
      <HowSection isDark={isDark} />

      {/* TESTIMONIALS */}
      <TestimonialsSection isDark={isDark} />

      {/* CTA */}
      <CTASection isDark={isDark} />

      {/* FOOTER */}
      <FooterSection isDark={isDark} wordmarkIn={wordmarkIn} />
    </div>
  );
};

// Features Component
const FeaturesSection = ({ isDark }) => (
  <section id="features" className="py-28 px-12 w-full box-border">
    <div className="max-w-7xl mx-auto">
      <p className="rv text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GREEN, letterSpacing: '0.14em' }}>
        Core Features
      </p>
      <h2
        className="rv d1 font-black leading-tight tracking-tight mb-5"
        style={{
          fontSize: 'clamp(44px, 5.5vw, 68px)',
          fontFamily: "'Clash Display', sans-serif",
          letterSpacing: '-0.03em'
        }}
      >
        Everything you need<br />to learn together
      </h2>
      <p
        className="rv d2 max-w-md font-light mb-16"
        style={{
          fontSize: '18px',
          color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)',
          lineHeight: '1.65'
        }}
      >
        Built for students who take learning seriously — and want to do it with others.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Study Groups - spans 2 columns */}
        <div
          className="rv fc md:col-span-2 p-8 rounded-3xl border relative overflow-hidden transition-all hover:-translate-y-1"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
            '--mx': '50%',
            '--my': '50%'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '19px', fontWeight: 600, marginBottom: '9px', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.02em' }}>
            Study Groups
          </h3>
          <p style={{ fontSize: '16px', color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)', lineHeight: '1.6', fontWeight: 300 }}>
            Create or join smart-matched groups by course, subject, or exam date. Your people, one click away.
          </p>
        </div>

        {/* AI Assistant - spans 2 rows */}
        <div
          className="rv d2 fc md:row-span-2 p-8 rounded-3xl border relative overflow-hidden"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🧠</div>
          <h3 style={{ fontSize: '19px', fontWeight: 600, marginBottom: '9px', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.02em' }}>
            AI Assistant
          </h3>
          <p style={{ fontSize: '14.5px', color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)', marginBottom: '16px', lineHeight: '1.6' }}>
            Ask anything. Get instant explanations, summaries, and quiz generation.
          </p>
          <div
            className="rounded-2xl p-4"
            style={{
              background: isDark ? '#111111' : '#F5F7F5',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`
            }}
          >
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: isDark ? 'rgba(242,242,242,0.25)' : 'rgba(12,12,12,0.3)', marginBottom: '12px' }}>
              "Explain the Krebs cycle simply"
            </div>
            <div style={{ fontSize: '13px', color: isDark ? '#F2F2F2' : '#0C0C0C', lineHeight: '1.6', borderLeft: `2px solid ${GREEN}`, paddingLeft: '12px' }}>
              The Krebs cycle runs in mitochondria, converting acetyl-CoA into ATP energy...
              <span className="inline-block w-0.5 h-3 bg-green-500 ml-0.5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Real-time Chat */}
        <div
          className="rv d1 fc md:col-span-2 p-8 rounded-3xl border relative overflow-hidden"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>💬</div>
          <h3 style={{ fontSize: '19px', fontWeight: 600, marginBottom: '9px', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.02em' }}>
            Real-time Chat
          </h3>
          <p style={{ fontSize: '14.5px', color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)', marginBottom: '16px' }}>
            Live team messaging right alongside your shared notes.
          </p>
          <div className="space-y-3">
            {[
              { name: 'ANYA', msg: 'Can someone explain the Krebs cycle? 😅', color: 'rgba(56,130,80,0.15)', textColor: GREEN },
              { name: 'JAMES', msg: 'Just pinned a diagram in our notes 📌', color: 'rgba(80,130,200,0.15)', textColor: '#6a9fd8' },
              { name: 'MAYA', msg: 'I asked the AI — check the summary 👇', color: 'rgba(200,140,80,0.15)', textColor: '#d4946a' }
            ].map((item, i) => (
              <div key={i} className="flex gap-2" style={{ opacity: 0, animation: `msgIn 0.4s ease forwards`, animationDelay: `${0.4 + i * 0.8}s` }}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: item.color, color: item.textColor }}
                >
                  {item.name[0]}
                </div>
                <div
                  className="rounded-2xl px-3 py-2 flex-grow"
                  style={{
                    background: isDark ? '#171717' : '#ECEEED',
                    fontSize: '12.5px',
                    lineHeight: '1.45'
                  }}
                >
                  <div style={{ fontSize: '10px', color: isDark ? 'rgba(242,242,242,0.25)' : 'rgba(12,12,12,0.3)', fontWeight: 600, marginBottom: '2px', letterSpacing: '0.03em' }}>
                    {item.name}
                  </div>
                  {item.msg}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div
          className="rv d1 fc p-8 rounded-3xl border"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>📝</div>
          <h3 style={{ fontSize: '19px', fontWeight: 600, marginBottom: '9px', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.02em' }}>
            Collaborative Notes
          </h3>
          <p style={{ fontSize: '14.5px', color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)', lineHeight: '1.6' }}>
            Live multi-user editing with highlights, comments, and annotations.
          </p>
        </div>

        {/* Flashcards */}
        <div
          className="rv d2 fc p-8 rounded-3xl border"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚡</div>
          <h3 style={{ fontSize: '19px', fontWeight: 600, marginBottom: '9px', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.02em' }}>
            AI Flashcards
          </h3>
          <p style={{ fontSize: '14.5px', color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)', lineHeight: '1.6' }}>
            One click turns your notes into spaced-repetition decks.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// How It Works
const HowSection = ({ isDark }) => (
  <section
    id="how-it-works"
    className="py-28 px-12 w-full box-border"
    style={{
      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      background: isDark ? '#111111' : '#ECEEED'
    }}
  >
    <div className="max-w-7xl mx-auto">
      <p className="rv text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GREEN, letterSpacing: '0.14em' }}>
        How It Works
      </p>
      <h2 className="rv d1 font-black leading-tight tracking-tight mb-16" style={{ fontSize: 'clamp(44px, 5.5vw, 68px)', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.03em' }}>
        Up and running<br />in minutes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {['Create account', 'Form a group', 'Collaborate live', 'Ace your exams'].map((title, i) => (
          <div key={i} className="rv text-center" style={{ animationDelay: `${0.08 * i}s` }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 font-black text-xl"
              style={{
                background: GREEN,
                color: '#fff',
                fontFamily: "'Clash Display', sans-serif"
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, fontFamily: "'Clash Display', sans-serif", marginBottom: '9px', letterSpacing: '-0.01em' }}>
              {title}
            </h3>
            <p style={{ fontSize: '15px', color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)', lineHeight: '1.6', fontWeight: 300 }}>
              {['Sign up free with your university email. No card needed — ever.', 'Create a room for your class or join one with an invite code.', 'Take notes together, chat, and query the AI — all in real time.', 'Generate flashcards, quizzes, and summaries with a single click.'][i]}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Testimonials
const TestimonialsSection = ({ isDark }) => (
  <section id="stories" className="py-28 px-12 w-full box-border">
    <div className="max-w-7xl mx-auto">
      <p className="rv text-xs font-bold uppercase tracking-widest mb-4" style={{ color: GREEN, letterSpacing: '0.14em' }}>
        Student Stories
      </p>
      <h2 className="rv d1 font-black leading-tight tracking-tight mb-16" style={{ fontSize: 'clamp(44px, 5.5vw, 68px)', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.03em' }}>
        Real results from<br />real students
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Priya Sharma', role: 'Biochemistry, Year 2', quote: 'My GPA went from 2.8 to 3.7 in one semester.', color: GREEN },
          { name: 'Marcus Chen', role: 'Computer Science, Year 3', quote: 'The AI flashcard generator alone saved us hours.', color: '#6a9fd8' },
          { name: 'Amara Osei', role: 'Law, Year 1', quote: 'Having an AI that explains complex topics was a game-changer.', color: '#d4946a' }
        ].map((t, i) => (
          <div
            key={i}
            className="rv p-8 rounded-3xl border transition-all hover:-translate-y-1"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
              animationDelay: `${0.08 * i}s`
            }}
          >
            <div style={{ color: GREEN, fontSize: '13px', letterSpacing: '2px', marginBottom: '14px' }}>★★★★★</div>
            <p style={{ fontSize: '18px', lineHeight: '1.5', marginBottom: '22px', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.01em' }}>
              "{t.quote}"
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: `${t.color}33`, color: t.color }}
              >
                {t.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                <div style={{ fontSize: '13px', color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// CTA Section
const CTASection = ({ isDark }) => (
  <section className="py-28 px-12 text-center relative overflow-hidden w-full box-border">
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 700px 400px at 50% 50%, rgba(56,130,80,0.09) 0%, transparent 70%)`
      }}
    />
    <div className="relative z-10 max-w-2xl mx-auto">
      <h2 className="rv font-black leading-tight tracking-tight mb-6" style={{ fontSize: 'clamp(52px, 8vw, 92px)', fontFamily: "'Clash Display', sans-serif", letterSpacing: '-0.03em' }}>
        Ready to study<br /><span style={{ color: GREEN }}>smarter?</span>
      </h2>
      <p className="rv d1 mb-11 font-light" style={{ fontSize: '19px', color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)', lineHeight: '1.6' }}>
        Join 250,000+ students already on StudySync. Free forever — no credit card required.
      </p>
      <div className="rv d2 flex gap-3 justify-center flex-wrap">
        <Link to="/register">
          <button
            className="px-8 py-4 rounded-2xl font-bold text-white flex items-center gap-2"
            style={{
              background: GREEN,
              fontSize: '15px',
              fontFamily: "'Clash Display', sans-serif",
              letterSpacing: '-0.01em',
              boxShadow: `0 6px 28px rgba(56,130,80,0.35)`
            }}
          >
            Start for Free <span>→</span>
          </button>
        </Link>
        <button
          className="px-7 py-4 rounded-2xl transition-all border"
          style={{
            background: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
            color: isDark ? '#F2F2F2' : '#0C0C0C',
            fontSize: '15px',
            fontWeight: 500
          }}
        >
          View Pricing
        </button>
      </div>
    </div>
  </section>
);

// Footer
const FooterSection = ({ isDark, wordmarkIn }) => (
  <section
    className="pt-16 px-12 w-full box-border"
    style={{
      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      background: isDark ? '#0C0C0C' : '#F5F7F5',
      position: 'relative'
    }}
  >
    {/* Meta row */}
    <div className="max-w-7xl mx-auto flex items-center justify-between mb-12 pb-12 flex-wrap gap-4 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded text-base font-bold flex items-center justify-center" style={{ background: GREEN, fontFamily: "'Clash Display', sans-serif" }}>
            📖
          </div>
          <span style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '15px' }}>StudySync</span>
        </div>
        <span style={{ fontSize: '13px', color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)', letterSpacing: '0.02em', fontWeight: 300 }}>
          Study Smarter, Together.
        </span>
      </div>
      <div className="flex gap-6 flex-wrap">
        {['Features', 'Pricing', 'About', 'Blog', 'Privacy', 'Terms'].map((link) => (
          <a
            key={link}
            href="#"
            className="text-xs transition-colors"
            style={{ color: isDark ? 'rgba(242,242,242,0.45)' : 'rgba(12,12,12,0.5)' }}
          >
            {link}
          </a>
        ))}
      </div>
    </div>

    {/* Giant Wordmark */}
    <div
      key={`wordmark-${isDark}`}
      id="giant-word"
      className={`relative text-center font-black leading-none tracking-tight py-24 transition-all duration-1000 ${wordmarkIn ? 'opacity-100' : 'opacity-0'}`}
      style={{
        fontSize: 'clamp(80px, 18vw, 260px)',
        fontFamily: "'Clash Display', sans-serif",
        letterSpacing: '-0.04em',
        background: wordmarkIn
          ? `linear-gradient(90deg, ${isDark ? '#F2F2F2' : '#0C0C0C'} 0%, ${isDark ? '#F2F2F2' : '#0C0C0C'} 48%, ${GREEN} 52%, ${GREEN} 100%)`
          : 'none',
        WebkitBackgroundClip: wordmarkIn ? 'text' : 'unset',
        WebkitTextFillColor: wordmarkIn ? 'transparent' : 'unset',
        backgroundClip: wordmarkIn ? 'text' : 'unset',
        transform: wordmarkIn ? 'translateY(0)' : 'translateY(60px)',
        lineHeight: 0.88
      }}
    >
      StudySync
    </div>

    {/* Bottom bar */}
    <div
      className="py-6 px-0 flex items-center justify-between flex-wrap gap-3 border-t"
      style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }}
    >
      <span style={{ fontSize: '12px', color: isDark ? 'rgba(242,242,242,0.25)' : 'rgba(12,12,12,0.3)' }}>
        © 2026 StudySync, Inc. All rights reserved.
      </span>
      <div className="flex gap-5">
        {['Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
          <a
            key={link}
            href="#"
            className="text-xs transition-colors"
            style={{ color: isDark ? 'rgba(242,242,242,0.25)' : 'rgba(12,12,12,0.3)' }}
          >
            {link}
          </a>
        ))}
      </div>
    </div>
  </section>
);

export default HomePage;
