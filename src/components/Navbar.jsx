import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Navbar({ onShowToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isFacilitiesPage = location.pathname.startsWith('/facilities');
  const isFriendliesPage = location.pathname.startsWith('/friendlies') || location.pathname.startsWith('/friendly-matches');
  const isCoachingPage = location.pathname.startsWith('/coaching');
  const isTrialsPage = location.pathname.startsWith('/trials');

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Facilities', path: '/facilities' },
    { label: 'Tournaments', path: '/tournaments' },
    { label: 'Friendly Matches', path: '/friendlies' },
    { label: 'Coaching', path: '/coaching' },
    { label: 'Trials', path: '/trials' }
  ];

  // Desktop active bubble refs & state
  const navContainerRef = useRef(null);
  const linkRefs = useRef({});
  const isFirstRender = useRef(true);
  const [bubble, setBubble] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });

  // Mobile active bubble refs & state
  const mobileNavContainerRef = useRef(null);
  const mobileLinkRefs = useRef({});
  const [mobileBubble, setMobileBubble] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });

  // Determine active nav key based on current URL path
  const getActiveKey = useCallback((pathname) => {
    if (pathname === '/' || pathname === '/home') return '/home';
    if (pathname.startsWith('/facilities')) return '/facilities';
    if (pathname.startsWith('/tournaments')) return '/tournaments';
    if (pathname.startsWith('/friendlies') || pathname.startsWith('/friendly-matches')) return '/friendlies';
    if (pathname.startsWith('/coaching')) return '/coaching';
    if (pathname.startsWith('/trials')) return '/trials';
    return null;
  }, []);

  const activeKey = getActiveKey(location.pathname);

  // Position calculation for the single shared desktop glass bubble
  const updateBubblePosition = useCallback(() => {
    if (!activeKey) {
      setBubble((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const activeEl = linkRefs.current[activeKey];
    const container = navContainerRef.current;

    if (activeEl && container) {
      const left = activeEl.offsetLeft;
      const top = activeEl.offsetTop;
      const width = activeEl.offsetWidth;
      const height = activeEl.offsetHeight;

      setBubble({
        left,
        top,
        width,
        height,
        opacity: 1
      });

      if (isFirstRender.current) {
        requestAnimationFrame(() => {
          isFirstRender.current = false;
        });
      }
    } else {
      setBubble((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeKey]);

  // Position calculation for mobile glass bubble
  const updateMobileBubblePosition = useCallback(() => {
    if (!activeKey || !isOpen) {
      setMobileBubble((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const activeEl = mobileLinkRefs.current[activeKey];
    const container = mobileNavContainerRef.current;

    if (activeEl && container) {
      const left = activeEl.offsetLeft;
      const top = activeEl.offsetTop;
      const width = activeEl.offsetWidth;
      const height = activeEl.offsetHeight;

      setMobileBubble({
        left,
        top,
        width,
        height,
        opacity: 1
      });
    }
  }, [activeKey, isOpen]);

  // Update bubble position when route changes or fonts load
  useEffect(() => {
    updateBubblePosition();
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        updateBubblePosition();
      });
    }
  }, [activeKey, updateBubblePosition]);

  // Recalculate on window resize & container resize
  useEffect(() => {
    const handleResize = () => {
      updateBubblePosition();
      if (isOpen) updateMobileBubblePosition();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let resizeObserver;
    if (navContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateBubblePosition();
      });
      resizeObserver.observe(navContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [updateBubblePosition, updateMobileBubblePosition, isOpen]);

  // Update mobile bubble when drawer opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        updateMobileBubblePosition();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, updateMobileBubblePosition]);

  // Scroll listener for enhanced backdrop density
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAccountAction = (label) => {
    onShowToast({
      title: `${label} (Prototype Notice)`,
      message: 'Accounts and authentication are not part of this prototype.',
      type: 'info',
      isDemo: true
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full pt-2.5 sm:pt-3.5 px-3 sm:px-6 lg:px-8 transition-all duration-300 pointer-events-none">
      {/* Floating iPhone-inspired Liquid Glass Container */}
      <div
        className={`pointer-events-auto max-w-7xl mx-auto rounded-2xl sm:rounded-[24px] transition-all duration-300 relative overflow-hidden ${
          scrolled ? 'liquid-glass-navbar-scrolled' : 'liquid-glass-navbar'
        } px-4 sm:px-6`}
      >
        {/* Upper Specular Light Glint (Liquid Glass Rim Reflection) */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        {/* Soft Ambient Refraction Glow in Upper Quadrant */}
        <div className="pointer-events-none absolute -top-10 left-1/4 w-80 h-20 bg-white/[0.08] blur-xl rounded-full" />

        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo Mark + Brand */}
          <Link
            to="/home"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 rounded-xl p-1 ${
              isFacilitiesPage
                ? 'focus-visible:ring-rose-500'
                : isFriendliesPage
                ? 'focus-visible:ring-sky-400'
                : isCoachingPage
                ? 'focus-visible:ring-red-500'
                : isTrialsPage
                ? 'focus-visible:ring-amber-500'
                : 'focus-visible:ring-[#c6ff3d]'
            }`}
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black transition-transform group-hover:scale-105 ${
                isFacilitiesPage
                  ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-[0_0_18px_rgba(244,63,94,0.35)]'
                  : isFriendliesPage
                  ? 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-[0_0_18px_rgba(56,189,248,0.35)]'
                  : isCoachingPage
                  ? 'bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white shadow-[0_0_18px_rgba(220,38,38,0.45)]'
                  : isTrialsPage
                  ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-[0_0_18px_rgba(245,158,11,0.45)]'
                  : 'bg-gradient-to-br from-[#c6ff3d] to-emerald-400 text-[#0a1020] shadow-[0_0_18px_rgba(198,255,61,0.35)]'
              }`}
            >
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-black tracking-wider uppercase text-white leading-none">
                Sport<span className={isFacilitiesPage ? 'text-rose-400' : isFriendliesPage ? 'text-sky-400' : isCoachingPage ? 'text-red-400' : isTrialsPage ? 'text-amber-400' : 'text-[#c6ff3d]'}>Link</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-300/80 tracking-widest uppercase font-semibold">
                Sports Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Track with Centered Shared Liquid Glass Bubble */}
          <nav
            ref={navContainerRef}
            className="hidden min-[900px]:flex items-center h-11 p-1 rounded-full bg-white/[0.05] border border-white/[0.12] shadow-[inset_0_1px_2px_rgba(0,0,0,0.22),0_1px_2px_rgba(255,255,255,0.05)] backdrop-blur-md relative"
          >
            {/* The Single Shared Animated Liquid Glass Bubble */}
            <div
              className="navbar-liquid-bubble absolute rounded-full z-0"
              style={{
                transform: `translate3d(${bubble.left}px, ${bubble.top}px, 0)`,
                width: `${bubble.width}px`,
                height: `${bubble.height}px`,
                opacity: bubble.opacity,
                transition: isFirstRender.current
                  ? 'opacity 150ms ease'
                  : 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), width 300ms cubic-bezier(0.22, 1, 0.36, 1), height 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease'
              }}
              aria-hidden="true"
            >
              {/* Internal Liquid Glass Specular Highlights */}
              <div className="absolute inset-x-3.5 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent" />
              <div
                className={`absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent ${
                  isFacilitiesPage ? 'via-rose-400/80' : isFriendliesPage ? 'via-sky-400/80' : isCoachingPage ? 'via-red-400/80' : isTrialsPage ? 'via-amber-400/80' : 'via-[#c6ff3d]/60'
                } to-transparent`}
              />
            </div>

            {navLinks.map((link) => {
              const isActive = activeKey === link.path;
              return (
                <NavLink
                  key={link.path}
                  ref={(el) => (linkRefs.current[link.path] = el)}
                  to={link.path}
                  end={link.path === '/'}
                  className={`relative z-10 h-9 px-3.5 xl:px-4 flex items-center justify-center text-xs xl:text-sm tracking-wide transition-colors duration-200 select-none rounded-full whitespace-nowrap ${
                    isActive
                      ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
                      : 'text-slate-200/90 hover:text-white font-medium hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden min-[900px]:flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAccountAction('Login')}
              className={`text-xs sm:text-sm font-semibold text-slate-200 hover:text-white px-4 py-2 transition-all duration-200 cursor-pointer rounded-full hover:bg-white/[0.08] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] focus-visible:outline-none focus-visible:ring-2 ${
                isFacilitiesPage
                  ? 'focus-visible:ring-rose-500'
                  : isFriendliesPage
                  ? 'focus-visible:ring-sky-400'
                  : isCoachingPage
                  ? 'focus-visible:ring-red-500'
                  : isTrialsPage
                  ? 'focus-visible:ring-amber-500'
                  : 'focus-visible:ring-[#c6ff3d]'
              }`}
            >
              Login
            </button>
            <Button
              variant={isFacilitiesPage ? 'crimson' : isFriendliesPage ? 'stadium' : isCoachingPage ? 'crimson' : isTrialsPage ? 'gold' : 'primary'}
              size="md"
              onClick={() => handleAccountAction('Get Started')}
              className="shadow-sm font-bold"
            >
              Get Started
            </Button>
          </div>

          {/* Hamburger Menu (Below 900px) */}
          <div className="flex items-center gap-2 min-[900px]:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className={`p-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/[0.12] border border-white/20 bg-white/[0.05] cursor-pointer transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 ${
                isFacilitiesPage
                  ? 'focus-visible:ring-rose-500'
                  : isFriendliesPage
                  ? 'focus-visible:ring-sky-400'
                  : isCoachingPage
                  ? 'focus-visible:ring-red-500'
                  : isTrialsPage
                  ? 'focus-visible:ring-amber-500'
                  : 'focus-visible:ring-[#c6ff3d]'
              }`}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Liquid Glass Drawer (Below 900px) */}
      {isOpen && (
        <div
          className="pointer-events-auto min-[900px]:hidden fixed inset-x-3 sm:inset-x-6 top-20 liquid-glass-navbar border border-white/25 shadow-2xl rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-4 duration-200 z-50 max-w-7xl mx-auto overflow-hidden relative"
          id="mobile-navigation"
        >
          {/* Top Glint for Mobile Drawer */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          <div className="space-y-4">
            <nav
              ref={mobileNavContainerRef}
              className="flex flex-col space-y-1 relative p-1.5 bg-white/[0.04] rounded-2xl border border-white/[0.10] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]"
            >
              {/* Mobile Shared Animated Liquid Glass Bubble */}
              <div
                className="navbar-liquid-bubble absolute rounded-xl z-0"
                style={{
                  transform: `translate3d(${mobileBubble.left}px, ${mobileBubble.top}px, 0)`,
                  width: `${mobileBubble.width}px`,
                  height: `${mobileBubble.height}px`,
                  opacity: mobileBubble.opacity,
                  transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1), height 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms ease'
                }}
                aria-hidden="true"
              >
                <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent" />
                <div
                  className={`absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent ${
                    isFacilitiesPage ? 'via-rose-400/80' : isFriendliesPage ? 'via-sky-400/80' : isCoachingPage ? 'via-red-400/80' : isTrialsPage ? 'via-amber-400/80' : 'via-[#c6ff3d]/60'
                  } to-transparent`}
                />
              </div>

              {navLinks.map((link) => {
                const isActive = activeKey === link.path;
                return (
                  <NavLink
                    key={link.path}
                    ref={(el) => (mobileLinkRefs.current[link.path] = el)}
                    to={link.path}
                    end={link.path === '/'}
                    onClick={() => setIsOpen(false)}
                    className={`relative z-10 flex items-center justify-between h-11 px-4 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]'
                        : 'text-slate-200/90 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isActive
                          ? isFacilitiesPage
                            ? 'text-rose-400 translate-x-0.5'
                            : isFriendliesPage
                            ? 'text-sky-400 translate-x-0.5'
                            : isCoachingPage
                            ? 'text-red-400 translate-x-0.5'
                            : isTrialsPage
                            ? 'text-amber-400 translate-x-0.5'
                            : 'text-[#c6ff3d] translate-x-0.5'
                          : 'text-slate-400'
                      }`}
                    />
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-white/15 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleAccountAction('Login');
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-100 bg-white/[0.08] border border-white/15 rounded-xl hover:bg-white/[0.15] transition-colors cursor-pointer"
              >
                Login
              </button>
              <Button
                variant={isFacilitiesPage ? 'crimson' : isFriendliesPage ? 'stadium' : isCoachingPage ? 'crimson' : isTrialsPage ? 'gold' : 'primary'}
                size="md"
                className="w-full font-bold"
                onClick={() => {
                  setIsOpen(false);
                  handleAccountAction('Get Started');
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
