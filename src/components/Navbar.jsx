import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Zap, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Navbar({ onShowToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Facilities', path: '/facilities' },
    { label: 'Tournaments', path: '/tournaments' },
    { label: 'Friendly Matches', path: '/friendlies' },
    { label: 'Coaching', path: '/coaching' },
    { label: 'Trials', path: '/trials' }
  ];

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
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        scrolled
          ? 'bg-[#0a1020]/95 backdrop-blur-md border-[#2a3652] shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
          : 'bg-[#0a1020]/90 backdrop-blur-sm border-[#2a3652]/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo Mark + Brand */}
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c6ff3d] rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c6ff3d] to-emerald-400 flex items-center justify-center text-[#0a1020] font-black shadow-[0_0_15px_rgba(198,255,61,0.35)] transition-transform group-hover:scale-105">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-['Barlow_Condensed'] text-2xl font-black tracking-wider uppercase text-white leading-none">
                Sport<span className="text-[#c6ff3d]">Link</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-widest uppercase font-medium">
                Sports Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Visible at 900px and above) */}
          <nav className="hidden min-[900px]:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 text-sm font-medium transition-colors rounded-lg tracking-wide ${
                    isActive
                      ? 'text-[#c6ff3d] font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#c6ff3d] rounded-full shadow-[0_0_8px_#c6ff3d]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden min-[900px]:flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAccountAction('Login')}
              className="text-sm font-semibold text-slate-300 hover:text-white px-3.5 py-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#c6ff3d] rounded-full"
            >
              Login
            </button>
            <Button
              variant="primary"
              size="md"
              onClick={() => handleAccountAction('Get Started')}
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
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-[#2a3652] focus-visible:ring-2 focus-visible:ring-[#c6ff3d] cursor-pointer"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Below 900px) */}
      {isOpen && (
        <div
          className="min-[900px]:hidden fixed inset-x-0 top-18 sm:top-20 bg-[#0a1020]/98 border-b border-[#2a3652] shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-200"
          id="mobile-navigation"
        >
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-[#c6ff3d]/10 text-[#c6ff3d] border border-[#c6ff3d]/30 font-semibold'
                        : 'text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </NavLink>
              ))}
            </nav>

            <div className="pt-4 border-t border-[#2a3652] flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleAccountAction('Login');
                }}
                className="w-full py-3 text-center text-sm font-semibold text-slate-200 bg-[#172033] border border-[#2a3652] rounded-full hover:border-slate-400 cursor-pointer"
              >
                Login
              </button>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
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
