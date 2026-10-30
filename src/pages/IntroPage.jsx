import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, ChevronDown } from 'lucide-react';

/**
 * Cinematic Scroll-Driven Intro Landing Page for SportLink
 * 
 * 5 Sequential Stages with Authentic SportLink Football-Ground & Dark Theme:
 * Stage 1: "DO YOU WANT TO" / "BOOK A TURF" (SportLink Lime #B6FF3B)
 * Stage 2: "WANT TO FIND" / "NEARBY TOURNAMENTS" (SportLink Cyan #00D4FF)
 * Stage 3: "WANT TO TRAIN" / "AND GROW??" (Training Amber #F59E0B)
 * Stage 4: "YOU ARE IN THE" / "RIGHT PLACE" (SportLink Lime #B6FF3B)
 * Stage 5: SportLink Brand Reveal (Logo + "SportLink" + Official Motto)
 */

const STAGES = [
  {
    id: 'stage-1',
    number: '01',
    line1: 'DO YOU WANT TO',
    line2: 'BOOK A TURF',
    textColor: '#B6FF3B',
    accentGlow: 'radial-gradient(circle, rgba(182, 255, 59, 0.22) 0%, transparent 70%)'
  },
  {
    id: 'stage-2',
    number: '02',
    line1: 'WANT TO FIND',
    line2: 'NEARBY TOURNAMENTS',
    textColor: '#00D4FF',
    accentGlow: 'radial-gradient(circle, rgba(0, 212, 255, 0.22) 0%, transparent 70%)'
  },
  {
    id: 'stage-3',
    number: '03',
    line1: 'WANT TO TRAIN',
    line2: 'AND GROW??',
    textColor: '#F59E0B',
    accentGlow: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)'
  },
  {
    id: 'stage-4',
    number: '04',
    line1: 'YOU ARE IN THE',
    line2: 'RIGHT PLACE',
    textColor: '#B6FF3B',
    accentGlow: 'radial-gradient(circle, rgba(182, 255, 59, 0.25) 0%, transparent 70%)'
  }
];

function smoothStep(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

function easeInOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}


// =========================================================================
// Innovative Black Line Architectural Vector Animations for Each Intro Stage
// =========================================================================
function StageBlackLines({ stageIndex }) {
  switch (stageIndex) {
    case 0: // Stage 1: Book a Turf (Football Turf Blueprint)
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 select-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {/* Outer Boundary Frame */}
          <rect x="120" y="90" width="1200" height="720" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="12 8" />
          
          {/* Halfway Line & Center Circle */}
          <line x1="720" y1="90" x2="720" y2="810" stroke="#000000" strokeWidth="2" />
          <circle cx="720" cy="450" r="140" fill="none" stroke="#000000" strokeWidth="2" />
          <circle cx="720" cy="450" r="140" fill="none" stroke="#000000" strokeWidth="1" strokeDasharray="6 8" className="animate-spin-slow origin-[720px_450px]" />
          <circle cx="720" cy="450" r="6" fill="#000000" />

          {/* Goal Penalty Boxes */}
          <rect x="120" y="270" width="220" height="360" fill="none" stroke="#000000" strokeWidth="1.75" />
          <rect x="120" y="360" width="80" height="180" fill="none" stroke="#000000" strokeWidth="1.5" />
          <path d="M 340 380 A 80 80 0 0 1 340 520" fill="none" stroke="#000000" strokeWidth="1.5" strokeDasharray="6 6" />

          <rect x="1100" y="270" width="220" height="360" fill="none" stroke="#000000" strokeWidth="1.75" />
          <rect x="1240" y="360" width="80" height="180" fill="none" stroke="#000000" strokeWidth="1.5" />
          <path d="M 1100 380 A 80 80 0 0 0 1100 520" fill="none" stroke="#000000" strokeWidth="1.5" strokeDasharray="6 6" />

          {/* Tactical Ball Pass Trajectory Vector with Animated Flow */}
          <path d="M 280 650 Q 520 250, 720 450 T 1160 380" fill="none" stroke="#000000" strokeWidth="2.5" strokeDasharray="14 10" className="animate-dash-flow" />
          <circle cx="1160" cy="380" r="8" fill="none" stroke="#000000" strokeWidth="2" />

          {/* Architectural Dimension Annotations */}
          <text x="140" y="125" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">FIFA STANDARD 105M × 68M</text>
          <text x="735" y="445" fill="#000000" fontFamily="monospace" fontSize="10" fontWeight="bold">R = 9.15M</text>
          <text x="1120" y="795" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold">TURF BOOKING // STAGE 01</text>
        </svg>
      );

    case 1: // Stage 2: Tournaments (Tournament Elimination Bracket Matrix & Trophy Wireframe)
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 select-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {/* Left Bracket Tree */}
          <path d="M 80 200 H 220 V 320 H 360 V 450 H 500" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="8 6" className="animate-dash-flow" />
          <path d="M 80 440 H 220 V 320" fill="none" stroke="#000000" strokeWidth="1.5" />
          <path d="M 80 560 H 220 V 680 H 360 V 450" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="8 6" className="animate-dash-flow" />
          <path d="M 80 800 H 220 V 680" fill="none" stroke="#000000" strokeWidth="1.5" />

          {/* Right Bracket Tree */}
          <path d="M 1360 200 H 1220 V 320 H 1080 V 450 H 940" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="8 6" className="animate-dash-flow" style={{ animationDirection: 'reverse' }} />
          <path d="M 1360 440 H 1220 V 320" fill="none" stroke="#000000" strokeWidth="1.5" />
          <path d="M 1360 560 H 1220 V 680 H 1080 V 450" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="8 6" className="animate-dash-flow" style={{ animationDirection: 'reverse' }} />
          <path d="M 1360 800 H 1220 V 680" fill="none" stroke="#000000" strokeWidth="1.5" />

          {/* Central Championship Trophy Wireframe */}
          <polygon points="720,240 780,310 770,410 740,470 740,540 790,570 650,570 700,540 700,470 670,410 660,310" fill="none" stroke="#000000" strokeWidth="2" />
          <line x1="660" y1="310" x2="780" y2="310" stroke="#000000" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="720" y1="240" x2="720" y2="540" stroke="#000000" strokeWidth="1" strokeDasharray="2 4" />

          {/* Connector Nodes */}
          <circle cx="500" cy="450" r="6" fill="#000000" />
          <circle cx="940" cy="450" r="6" fill="#000000" />

          {/* Annotations */}
          <text x="100" y="160" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">KNOCKOUT BRACKET // MATRIX</text>
          <text x="660" y="610" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">FINALS ARENA</text>
          <text x="1140" y="160" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">ELIMINATION GRID</text>
        </svg>
      );

    case 2: // Stage 3: Train and Grow (Athletic Performance Curve & Stopwatch Radar)
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 select-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {/* Coordinate Grid Lines */}
          <line x1="160" y1="740" x2="1280" y2="740" stroke="#000000" strokeWidth="2" />
          <line x1="160" y1="160" x2="160" y2="740" stroke="#000000" strokeWidth="2" />
          {[260, 360, 460, 560, 660].map((y) => (
            <line key={y} x1="150" y1={y} x2="1280" y2={y} stroke="#000000" strokeWidth="0.75" strokeDasharray="6 6" />
          ))}

          {/* Parabolic Athletic Growth Curve */}
          <path d="M 160 700 C 450 680, 680 520, 920 320 S 1180 180, 1280 160" fill="none" stroke="#000000" strokeWidth="3" />
          <path d="M 160 700 C 450 680, 680 520, 920 320 S 1180 180, 1280 160" fill="none" stroke="#000000" strokeWidth="6" strokeDasharray="20 40" className="animate-dash-flow" />

          {/* Milestone Nodes */}
          <circle cx="450" cy="620" r="6" fill="#000000" />
          <circle cx="780" cy="420" r="6" fill="#000000" />
          <circle cx="1060" cy="240" r="7" fill="#000000" />
          <circle cx="1280" cy="160" r="9" fill="#000000" />

          {/* Technical Radar / Stopwatch Circle in Corner */}
          <g transform="translate(1180, 620)">
            <circle cx="0" cy="0" r="80" fill="none" stroke="#000000" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="60" fill="none" stroke="#000000" strokeWidth="1" strokeDasharray="4 6" className="animate-spin-slow" />
            <line x1="0" y1="-80" x2="0" y2="80" stroke="#000000" strokeWidth="1" />
            <line x1="-80" y1="0" x2="80" y2="0" stroke="#000000" strokeWidth="1" />
            <line x1="0" y1="0" x2="45" y2="-45" stroke="#000000" strokeWidth="2" className="animate-spin-slow origin-center" style={{ animationDuration: '6s' }} />
          </g>

          {/* Annotations */}
          <text x="180" y="200" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">ATHLETE SKILL INDEX // 99.8% PEAK</text>
          <text x="180" y="770" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">PROGRESSION TIMELINE (WEEKS 01 - 52)</text>
        </svg>
      );

    case 3: // Stage 4: Right Place (Viewfinder Target & 4-Way Sports Convergence)
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 select-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {/* Viewfinder Target Framing Brackets [   ] */}
          <path d="M 80 160 V 80 H 160" fill="none" stroke="#000000" strokeWidth="3" />
          <path d="M 1360 160 V 80 H 1280" fill="none" stroke="#000000" strokeWidth="3" />
          <path d="M 80 740 V 820 H 160" fill="none" stroke="#000000" strokeWidth="3" />
          <path d="M 1360 740 V 820 H 1280" fill="none" stroke="#000000" strokeWidth="3" />

          {/* Crosshair Axes */}
          <line x1="720" y1="60" x2="720" y2="840" stroke="#000000" strokeWidth="1.5" strokeDasharray="16 8" />
          <line x1="60" y1="450" x2="1380" y2="450" stroke="#000000" strokeWidth="1.5" strokeDasharray="16 8" />

          {/* Interlocking Orbital Sports Rings */}
          <circle cx="720" cy="450" r="180" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="10 8" className="animate-spin-slow origin-[720px_450px]" />
          <circle cx="720" cy="450" r="280" fill="none" stroke="#000000" strokeWidth="1.5" strokeDasharray="18 12" className="animate-spin-slow origin-[720px_450px]" style={{ animationDirection: 'reverse', animationDuration: '36s' }} />

          {/* 4 Diagonal Vectors Converging to Nexus */}
          <line x1="160" y1="140" x2="560" y2="350" stroke="#000000" strokeWidth="1.5" strokeDasharray="6 6" className="animate-dash-flow" />
          <line x1="1280" y1="140" x2="880" y2="350" stroke="#000000" strokeWidth="1.5" strokeDasharray="6 6" className="animate-dash-flow" />
          <line x1="160" y1="760" x2="560" y2="550" stroke="#000000" strokeWidth="1.5" strokeDasharray="6 6" className="animate-dash-flow" />
          <line x1="1280" y1="760" x2="880" y2="550" stroke="#000000" strokeWidth="1.5" strokeDasharray="6 6" className="animate-dash-flow" />

          {/* Technical Annotations */}
          <text x="180" y="110" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">SPORTS NEXUS // ALL-IN-ONE HUB</text>
          <text x="180" y="805" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">COORDINATE 18.5204° N, 73.8567° E</text>
          <text x="1050" y="805" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="2">LOCK STATUS: 100% READY</text>
        </svg>
      );

    default:
      return null;
  }
}

export default function IntroPage() {
  const navigate = useNavigate();
  const trackRef = useRef(null);

  const stageRefs = useRef([]);
  const brandRevealRef = useRef(null);
  const progressBarRef = useRef(null);
  const stageNumberRef = useRef(null);
  const scrollHelperRef = useRef(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  const redirectTimerRef = useRef(null);
  const hasTriggeredRedirect = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const snapTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const scrollDirectionRef = useRef(1);

  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const pitchBg = `${cleanBase}football-pitch-bg.svg`;

  // Configure body background & check motion preferences on mount
  useEffect(() => {
    const prevBgImage = document.body.style.backgroundImage;
    const prevBgColor = document.body.style.backgroundColor;
    const prevOverflowX = document.body.style.overflowX;

    document.title = 'SportLink — Choose Your Game. Live Your Passion.';
    document.body.style.backgroundImage = `linear-gradient(rgba(11, 15, 20, 0.45), rgba(11, 15, 20, 0.65)), url('${pitchBg}')`;
    document.body.style.backgroundColor = '#0B0F14';
    document.body.style.overflowX = 'hidden';

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    }

    return () => {
      document.body.style.backgroundImage = prevBgImage;
      document.body.style.backgroundColor = prevBgColor;
      document.body.style.overflowX = prevOverflowX;
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
  }, [pitchBg]);

  // Complete intro and transition smoothly to the platform homepage (/home)
  const proceedToHomepage = useCallback(() => {
    if (hasTriggeredRedirect.current) return;
    hasTriggeredRedirect.current = true;

    setIsExiting(true);
    sessionStorage.setItem('sportlink_intro_seen', 'true');

    setTimeout(() => {
      navigate('/home', { replace: true });
    }, 380);
  }, [navigate]);

  // Smooth programmatic jump to any stage index (0 to 4)
  const scrollToStage = useCallback((index) => {
    const vh = window.innerHeight;
    const targetY = Math.max(0, Math.min(4, index)) * vh;
    isAutoScrollingRef.current = true;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });

    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 550);
  }, []);

  // Core continuous scroll calculations
  const updateScrollAnimations = useCallback(() => {
    const vh = window.innerHeight || 1;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const totalMax = 4 * vh;
    const progress = Math.min(1, Math.max(0, scrollY / totalMax));
    const continuousSegment = scrollY / vh;

    if (Math.abs(scrollY - lastScrollYRef.current) > 2) {
      scrollDirectionRef.current = scrollY >= lastScrollYRef.current ? 1 : -1;
      lastScrollYRef.current = scrollY;
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progress * 100}%`;
    }

    if (scrollHelperRef.current) {
      const helperOpacity = Math.max(0, 1 - progress * 10);
      scrollHelperRef.current.style.opacity = helperOpacity.toString();
      scrollHelperRef.current.style.pointerEvents = helperOpacity <= 0.05 ? 'none' : 'auto';
    }

    const currentDominant = Math.min(4, Math.max(0, Math.round(continuousSegment)));
    setActiveStage(currentDominant);
    if (stageNumberRef.current) {
      stageNumberRef.current.textContent = `0${currentDominant + 1} / 05`;
    }

    // Stages 1 to 4 horizontal transitions
    STAGES.forEach((_, idx) => {
      const el = stageRefs.current[idx];
      if (!el) return;

      const diff = continuousSegment - idx;

      if (Math.abs(diff) > 1.25) {
        el.style.opacity = '0';
        el.style.transform = `translate3d(${diff > 0 ? -125 : 125}%, 0, 0)`;
        el.style.visibility = 'hidden';
      } else {
        el.style.visibility = 'visible';

        if (diff === 0) {
          el.style.transform = 'translate3d(0%, 0, 0)';
          el.style.opacity = '1';
          el.style.filter = 'blur(0px)';
        } else if (diff > 0) {
          const ease = easeInOutCubic(diff);
          const translateX = -ease * 125;
          const opacity = Math.max(0, 1 - ease * 1.2);
          const blur = ease * 3.5;
          el.style.transform = `translate3d(${translateX.toFixed(2)}%, 0, 0)`;
          el.style.opacity = opacity.toFixed(3);
          el.style.filter = `blur(${blur.toFixed(1)}px)`;
        } else {
          const ease = easeInOutCubic(-diff);
          const translateX = ease * 125;
          const opacity = Math.max(0, 1 - ease * 1.2);
          const blur = ease * 3.5;
          el.style.transform = `translate3d(${translateX.toFixed(2)}%, 0, 0)`;
          el.style.opacity = opacity.toFixed(3);
          el.style.filter = `blur(${blur.toFixed(1)}px)`;
        }
      }
    });

    // Stage 5: SportLink Brand Reveal
    const brandEl = brandRevealRef.current;
    if (brandEl) {
      const stage5Progress = continuousSegment - 3.0;

      if (stage5Progress < 0.05) {
        brandEl.style.opacity = '0';
        brandEl.style.transform = 'translate3d(0, 45px, 0) scale(0.92)';
        brandEl.style.visibility = 'hidden';

        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
          redirectTimerRef.current = null;
        }
      } else if (stage5Progress < 0.95) {
        const ease = smoothStep(stage5Progress);
        const translateY = (1 - ease) * 45;
        const scale = 0.92 + ease * 0.08;
        brandEl.style.opacity = ease.toFixed(3);
        brandEl.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        brandEl.style.visibility = 'visible';

        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
          redirectTimerRef.current = null;
        }
      } else {
        brandEl.style.opacity = '1';
        brandEl.style.transform = 'translate3d(0, 0px, 0) scale(1)';
        brandEl.style.visibility = 'visible';

        if (!redirectTimerRef.current && !hasTriggeredRedirect.current) {
          redirectTimerRef.current = setTimeout(() => {
            proceedToHomepage();
          }, 2400);
        }
      }
    }
  }, [proceedToHomepage]);

  useEffect(() => {
    let animationFrameId;

    const handleScroll = () => {
      if (isAutoScrollingRef.current) {
        updateScrollAnimations();
        return;
      }

      animationFrameId = requestAnimationFrame(updateScrollAnimations);

      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }

      snapTimeoutRef.current = setTimeout(() => {
        const vh = window.innerHeight;
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const continuous = scrollY / vh;
        const floorIdx = Math.floor(continuous);
        const frac = continuous - floorIdx;

        let targetIdx = floorIdx;
        if (scrollDirectionRef.current === 1) {
          targetIdx = frac > 0.45 ? Math.min(4, floorIdx + 1) : floorIdx;
        } else {
          targetIdx = frac < 0.55 ? floorIdx : Math.min(4, floorIdx + 1);
        }

        const targetY = targetIdx * vh;
        if (Math.abs(scrollY - targetY) > 8) {
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
        }
      }, 160);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateScrollAnimations();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [updateScrollAnimations]);

  return (
    <div
      ref={trackRef}
      className={`relative w-full bg-transparent text-[#F5F7FA] transition-opacity duration-350 select-none ${
        isExiting ? 'opacity-0 scale-[1.02] filter blur-[2px]' : 'opacity-100 scale-100'
      }`}
      style={{
        height: prefersReducedMotion ? '100vh' : '500vh',
        fontFamily: 'var(--font-display, "Outfit", sans-serif)'
      }}
    >
      {/* Dynamic Route-Aware Fixed Football Pitch Background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
        style={{
          backgroundImage: `linear-gradient(rgba(11, 15, 20, 0.50), rgba(11, 15, 20, 0.70)), url('${pitchBg}')`
        }}
        aria-hidden="true"
      />

      {/* Invisible snap anchor points */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-screen w-full" />
        <div className="h-screen w-full" />
        <div className="h-screen w-full" />
        <div className="h-screen w-full" />
        <div className="h-screen w-full" />
      </div>

      {/* TOP HEADER: Liquid Glass Brand Badge, Stage Counter, and Skip to Home Action */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-5 sm:py-6 bg-[#0B0F14]/75 backdrop-blur-xl border-b border-[#293442]/80 transition-all pointer-events-auto">
        {/* Left: Authentic SportLink Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c6ff3d] to-emerald-400 text-[#0a1020] flex items-center justify-center font-black shadow-[0_0_12px_rgba(198,255,61,0.35)] ring-2 ring-white/10">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-['Outfit'] font-black uppercase text-lg sm:text-xl tracking-wider text-white">
            Sport<span className="text-[#c6ff3d]">link</span>
          </span>
        </div>

        {/* Center: Active Stage Counter */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#141B24]/80 border border-[#293442]">
          <span
            ref={stageNumberRef}
            className="font-mono text-xs font-bold uppercase tracking-widest text-[#B6FF3B]"
          >
            01 / 05
          </span>
        </div>

        {/* Right: Accessible "Skip to Home" Action */}
        <button
          type="button"
          onClick={proceedToHomepage}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase text-white hover:text-[#c6ff3d] bg-white/[0.06] hover:bg-white/[0.12] border border-[#293442] hover:border-[#c6ff3d]/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c6ff3d]"
          aria-label="Skip intro and go directly to platform home"
        >
          <span>Skip to Home</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#B6FF3B] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Top Scroll Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#141B24] z-50 pointer-events-none">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-[#B6FF3B] via-[#00D4FF] to-emerald-400 transition-all duration-75 shadow-[0_0_8px_rgba(182,255,59,0.6)]"
          style={{ width: '0%' }}
        />
      </div>

      {/* Vertical Stage Navigation Dots */}
      <nav
        aria-label="Intro Stages"
        className="fixed right-5 sm:right-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3.5 pointer-events-auto"
      >
        {[0, 1, 2, 3, 4].map((idx) => {
          const isActive = activeStage === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToStage(idx)}
              aria-label={`Jump to stage 0${idx + 1}`}
              className="group relative flex items-center justify-center p-1 cursor-pointer focus:outline-none"
            >
              <span
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-2.5 h-8 bg-[#c6ff3d] shadow-[0_0_12px_rgba(198,255,61,0.6)]'
                    : 'w-2 h-2 bg-slate-600 group-hover:bg-slate-400 group-hover:scale-125'
                }`}
              />
              <span className="absolute right-6 px-2.5 py-0.5 rounded bg-[#141B24] border border-[#293442] text-[#c6ff3d] text-[10px] font-mono font-bold tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                0{idx + 1}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sticky Fullscreen Stage Canvas */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-transparent flex items-center justify-center px-4 sm:px-8 pointer-events-none z-10">
        
        {/* Stages 1 - 4: Stacked Headlines with Fluid Scroll Motion */}
        {STAGES.map((stage, idx) => (
          <div
            key={stage.id}
            ref={(el) => (stageRefs.current[idx] = el)}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8 will-change-transform pointer-events-none overflow-hidden"
            style={{
              transform: idx === 0 ? 'translate3d(0, 0, 0)' : 'translate3d(125%, 0, 0)',
              opacity: idx === 0 ? 1 : 0,
              visibility: idx === 0 ? 'visible' : 'hidden'
            }}
          >
{/* Innovative Black Line Sports Geometry & Blueprint Animations */}
            <StageBlackLines stageIndex={idx} />
            {/* Subtle Atmospheric Accent Glow Behind Text */}
            <div
              className="absolute w-[450px] sm:w-[650px] h-[220px] sm:h-[320px] rounded-full blur-[90px] pointer-events-none -z-10"
              style={{
                background: stage.accentGlow,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />

            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center">
              <h1
                className="font-['Outfit'] font-black uppercase tracking-tight md:tracking-tighter text-center leading-[0.98] sm:leading-[0.95] drop-shadow-2xl select-none"
                style={{
                  color: stage.textColor,
                  fontSize: 'clamp(2.75rem, 7.2vw, 6.4rem)'
                }}
              >
                <span className="block whitespace-nowrap text-white drop-shadow-md">{stage.line1}</span>
                <span className="block whitespace-nowrap mt-2 sm:mt-3 md:mt-4 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">{stage.line2}</span>
              </h1>
            </div>
          </div>
        ))}

        {/* Stage 5: SportLink Brand Reveal */}
        <div
          ref={brandRevealRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8 will-change-transform pointer-events-none overflow-hidden"
          style={{
            transform: 'translate3d(0, 45px, 0) scale(0.92)',
            opacity: 0,
            visibility: 'hidden'
          }}
        >
          {/* Innovative Black Line Speed Burst & Kinetic Shield Animations */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 select-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1="720"
                y1="450"
                x2={720 + 640 * Math.cos((deg * Math.PI) / 180)}
                y2={450 + 640 * Math.sin((deg * Math.PI) / 180)}
                stroke="#000000"
                strokeWidth="1.5"
                strokeDasharray="16 16"
                className="animate-dash-flow"
              />
            ))}
            <polygon points="720,270 876,360 876,540 720,630 564,540 564,360" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="8 6" className="animate-spin-slow origin-[720px_450px]" style={{ animationDuration: '40s' }} />
            <polygon points="720,210 928,330 928,570 720,690 512,570 512,330" fill="none" stroke="#000000" strokeWidth="1" strokeDasharray="12 12" />
            <text x="720" y="830" textAnchor="middle" fill="#000000" fontFamily="monospace" fontSize="11" fontWeight="bold" letterSpacing="3">SPORTLINK ATHLETIC ECOSYSTEM &bull; VERIFIED PLATFORM</text>
          </svg>
          {/* Subtle Red/Green Glow */}
          <div
            className="absolute w-[500px] sm:w-[700px] h-[350px] rounded-full blur-[110px] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(198,255,61,0.20) 0%, rgba(0,212,255,0.15) 100%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />

          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-6 sm:space-y-8 pointer-events-auto">
            {/* SportLink Logo Badge */}
            <div className="relative group cursor-pointer" onClick={proceedToHomepage}>
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#c6ff3d] via-emerald-400 to-[#00d4ff] text-[#0a1020] flex items-center justify-center font-black shadow-[0_16px_50px_rgba(198,255,61,0.35)] ring-4 ring-white/20 transition-transform group-hover:scale-105">
                <Zap className="w-11 h-11 sm:w-14 sm:h-14 fill-current drop-shadow-md" />
              </div>
            </div>

            {/* Brand Wordmark & Official Motto */}
            <div className="space-y-3 sm:space-y-4">
              <h1
                className="font-['Outfit'] font-black uppercase tracking-tight sm:tracking-tighter leading-none text-white drop-shadow-xl"
                style={{
                  fontSize: 'clamp(3.5rem, 11vw, 8rem)'
                }}
              >
                Sport<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c6ff3d] to-[#00d4ff]">link</span>
              </h1>

              <p
                className="font-['Plus_Jakarta_Sans'] font-semibold tracking-wide text-slate-300 drop-shadow-md"
                style={{
                  fontSize: 'clamp(1.1rem, 2.6vw, 1.75rem)'
                }}
              >
                &ldquo;Your Game. Your Ground. Your Opportunity.&rdquo;
              </p>
            </div>

            <button
              type="button"
              onClick={proceedToHomepage}
              className="mt-4 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#c6ff3d] to-emerald-400 text-[#0a1020] font-black text-sm uppercase tracking-wider hover:opacity-95 shadow-[0_0_25px_rgba(198,255,61,0.4)] transition-all cursor-pointer hover:scale-105"
            >
              Enter SportLink Platform &rarr;
            </button>
          </div>
        </div>

        {/* Ambient Bottom Scroll Cue */}
        <div
          ref={scrollHelperRef}
          onClick={() => scrollToStage(activeStage < 4 ? activeStage + 1 : 4)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#c6ff3d] text-xs font-bold uppercase tracking-widest pointer-events-auto transition-all cursor-pointer group"
          title="Click or scroll to advance"
        >
          <span className="group-hover:translate-y-[-1px] transition-transform">Scroll or Click to Advance</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#c6ff3d] group-hover:translate-y-1" />
        </div>

      </div>

      {/* Reduced-Motion Alternate Layout Fallback */}
      {prefersReducedMotion && (
        <div className="fixed inset-0 z-50 bg-[#0B0F14] flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c6ff3d] to-emerald-400 text-[#0a1020] flex items-center justify-center shadow-lg">
            <Zap className="w-9 h-9 fill-current" />
          </div>
          <h1 className="text-4xl font-black text-white font-['Outfit'] uppercase">
            Sport<span className="text-[#c6ff3d]">link</span>
          </h1>
          <p className="text-lg font-semibold text-slate-300 font-['Plus_Jakarta_Sans']">
            &ldquo;Your Game. Your Ground. Your Opportunity.&rdquo;
          </p>
          <button
            type="button"
            onClick={proceedToHomepage}
            className="px-6 py-3 rounded-xl bg-[#c6ff3d] text-[#0a1020] font-black text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
          >
            Enter SportLink Platform
          </button>
        </div>
      )}
    </div>
  );
}
