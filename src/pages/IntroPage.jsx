import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, ChevronDown } from 'lucide-react';

/**
 * Cinematic Scroll-Driven Intro Landing Page for Sportlink
 * 
 * 5 Sequential Stages:
 * Stage 1: "DO YOU WANT TO" / "BOOK A TURF" (Turf Green #15803D)
 * Stage 2: "WANT TO FIND" / "NEARBY TOURNAMENTS" (Brand Red #DC2626)
 * Stage 3: "WANT TO TRAIN" / "AND GROW??" (Royal Blue #1D4ED8)
 * Stage 4: "YOU ARE IN THE" / "RIGHT PLACE" (Sportlink Green #15803D)
 * Stage 5: Sportlink Brand Reveal (Logo + "Sportlink" + Official Motto)
 * 
 * Key Enhancements:
 * 1. Headlines are formatted into TWO BOLD STACKED LINES across all devices for maximum attractiveness.
 * 2. Simpler, butter-smooth scroll dynamics with halfway auto-advancement & magnetic snapping.
 * 3. Acts as the website's landing page, redirecting smoothly to `/home` on completion or skip.
 */

const STAGES = [
  {
    id: 'stage-1',
    number: '01',
    line1: 'DO YOU WANT TO',
    line2: 'BOOK A TURF',
    textColor: '#15803D', // Established Athletic Turf Green (WCAG contrast > 4.5:1 on white)
    accentGlow: 'rgba(21, 128, 61, 0.08)'
  },
  {
    id: 'stage-2',
    number: '02',
    line1: 'WANT TO FIND',
    line2: 'NEARBY TOURNAMENTS',
    textColor: '#DC2626', // Sportlink Brand Red (WCAG contrast > 4.5:1 on white)
    accentGlow: 'rgba(220, 38, 38, 0.08)'
  },
  {
    id: 'stage-3',
    number: '03',
    line1: 'WANT TO TRAIN',
    line2: 'AND GROW??',
    textColor: '#1D4ED8', // Visually Striking Royal Blue (WCAG contrast > 4.5:1 on white)
    accentGlow: 'rgba(29, 78, 216, 0.08)'
  },
  {
    id: 'stage-4',
    number: '04',
    line1: 'YOU ARE IN THE',
    line2: 'RIGHT PLACE',
    textColor: '#15803D', // Confident Sportlink Green (WCAG contrast > 4.5:1 on white)
    accentGlow: 'rgba(21, 128, 61, 0.08)'
  }
];

// Smooth step easing curve for fluid, responsive transitions
function smoothStep(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

// Cubic ease-in-out for silky deceleration at endpoints
function easeInOutCubic(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

export default function IntroPage() {
  const navigate = useNavigate();
  const trackRef = useRef(null);

  // Direct DOM references for 60-120fps continuous GPU transforms without React re-render overhead
  const stageRefs = useRef([]);
  const brandRevealRef = useRef(null);
  const progressBarRef = useRef(null);
  const stageNumberRef = useRef(null);
  const scrollHelperRef = useRef(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [activeStage, setActiveStage] = useState(0);

  // Timer & state refs
  const redirectTimerRef = useRef(null);
  const hasTriggeredRedirect = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const snapTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const scrollDirectionRef = useRef(1); // 1 = down, -1 = up

  // Configure body background & check motion preferences on mount
  useEffect(() => {
    const prevBgImage = document.body.style.backgroundImage;
    const prevBgColor = document.body.style.backgroundColor;
    const prevOverflowX = document.body.style.overflowX;

    document.title = 'Sportlink — Welcome';
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#FFFFFF';
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
  }, []);

  // Complete intro and transition smoothly to the platform homepage (/home)
  const proceedToHomepage = useCallback(() => {
    if (hasTriggeredRedirect.current) return;
    hasTriggeredRedirect.current = true;

    setIsExiting(true);
    sessionStorage.setItem('sportlink_intro_seen', 'true');

    // Soft exit animation duration before actual route switch
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

  // Core continuous scroll calculations with halfway ease & direct GPU transforms
  const updateScrollAnimations = useCallback(() => {
    const vh = window.innerHeight || 1;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const totalMax = 4 * vh;
    const progress = Math.min(1, Math.max(0, scrollY / totalMax));
    const continuousSegment = scrollY / vh; // 0.0 to 4.0

    // Detect scroll direction
    if (Math.abs(scrollY - lastScrollYRef.current) > 2) {
      scrollDirectionRef.current = scrollY >= lastScrollYRef.current ? 1 : -1;
      lastScrollYRef.current = scrollY;
    }

    // Update top progress indicator bar
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progress * 100}%`;
    }

    // Hide bottom scroll helper once user has started exploring
    if (scrollHelperRef.current) {
      const helperOpacity = Math.max(0, 1 - progress * 10);
      scrollHelperRef.current.style.opacity = helperOpacity.toString();
      scrollHelperRef.current.style.pointerEvents = helperOpacity <= 0.05 ? 'none' : 'auto';
    }

    // Determine current dominant stage (0 to 4)
    const currentDominant = Math.min(4, Math.max(0, Math.round(continuousSegment)));
    setActiveStage(currentDominant);
    if (stageNumberRef.current) {
      stageNumberRef.current.textContent = `0${currentDominant + 1} / 05`;
    }

    // --- STAGES 1 TO 4: HORIZONTAL SCROLL-DRIVEN TRANSLATION ---
    STAGES.forEach((_, idx) => {
      const el = stageRefs.current[idx];
      if (!el) return;

      const diff = continuousSegment - idx; // < 0: upcoming from right, 0: centered, > 0: exiting to left

      if (Math.abs(diff) > 1.25) {
        // Completely out of viewport
        el.style.opacity = '0';
        el.style.transform = `translate3d(${diff > 0 ? -125 : 125}%, 0, 0)`;
        el.style.visibility = 'hidden';
      } else {
        el.style.visibility = 'visible';

        if (diff === 0) {
          // Perfectly centered
          el.style.transform = 'translate3d(0%, 0, 0)';
          el.style.opacity = '1';
          el.style.filter = 'blur(0px)';
        } else if (diff > 0) {
          // Exiting to left (0 to 1)
          const ease = easeInOutCubic(diff);
          const translateX = -ease * 125;
          const opacity = Math.max(0, 1 - ease * 1.2);
          const blur = ease * 3.5;
          el.style.transform = `translate3d(${translateX.toFixed(2)}%, 0, 0)`;
          el.style.opacity = opacity.toFixed(3);
          el.style.filter = `blur(${blur.toFixed(1)}px)`;
        } else {
          // Entering from right (-1 to 0)
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

    // --- STAGE 5: SPORTLINK BRAND REVEAL ---
    const brandEl = brandRevealRef.current;
    if (brandEl) {
      const stage5Progress = continuousSegment - 3.0; // 0 to 1.0 (segment 3.0 to 4.0)

      if (stage5Progress < 0.05) {
        brandEl.style.opacity = '0';
        brandEl.style.transform = 'translate3d(0, 45px, 0) scale(0.92)';
        brandEl.style.visibility = 'hidden';

        // Clear redirect timer if user scrolls back up
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

        // Not fully settled yet, keep timer cleared
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
          redirectTimerRef.current = null;
        }
      } else {
        // >= 0.95: Brand composition is fully visible, centered, and rock-solid!
        brandEl.style.opacity = '1';
        brandEl.style.transform = 'translate3d(0, 0, 0) scale(1.0)';
        brandEl.style.visibility = 'visible';

        // Start the strict 1.2-second (1200ms) timer once reached!
        if (!redirectTimerRef.current && !hasTriggeredRedirect.current) {
          redirectTimerRef.current = setTimeout(() => {
            proceedToHomepage();
          }, 1200);
        }
      }
    }
  }, [proceedToHomepage]);

  // RequestAnimationFrame scroll loop + debounced magnetic snap for halfway auto-advancement
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollAnimations();
          ticking = false;
        });
        ticking = true;
      }

      // Halfway auto-advancement: if user pauses scroll halfway, magnetically guide to nearest stage
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }

      if (!isAutoScrollingRef.current) {
        snapTimeoutRef.current = setTimeout(() => {
          const vh = window.innerHeight || 1;
          const scrollY = window.scrollY || window.pageYOffset || 0;
          const segment = scrollY / vh;
          const currentStage = Math.floor(segment);
          const fraction = segment - currentStage;

          // If resting between stages (not already parked)
          if (fraction > 0.05 && fraction < 0.95) {
            let targetStage = currentStage;

            // Halfway threshold: if scrolled >= 35% down, magnetically complete to next stage
            if (scrollDirectionRef.current === 1 && fraction >= 0.35) {
              targetStage = Math.min(4, currentStage + 1);
            } else if (scrollDirectionRef.current === -1 && fraction <= 0.65) {
              targetStage = currentStage;
            } else if (fraction >= 0.5) {
              targetStage = Math.min(4, currentStage + 1);
            }

            scrollToStage(targetStage);
          }
        }, 80);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial calculation on mount
    updateScrollAnimations();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
      }
    };
  }, [updateScrollAnimations, scrollToStage]);

  // Keyboard navigation for accessible & smooth stage progression
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        const vh = window.innerHeight || 1;
        const currentStage = Math.round((window.scrollY || 0) / vh);
        if (currentStage < 4) {
          scrollToStage(currentStage + 1);
        } else {
          proceedToHomepage();
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        const vh = window.innerHeight || 1;
        const currentStage = Math.round((window.scrollY || 0) / vh);
        if (currentStage > 0) {
          scrollToStage(currentStage - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToStage, proceedToHomepage]);

  return (
    <div
      ref={trackRef}
      className={`relative w-full bg-white text-slate-900 transition-opacity duration-350 select-none ${
        isExiting ? 'opacity-0 scale-[1.02] filter blur-[2px]' : 'opacity-100 scale-100'
      }`}
      style={{
        height: prefersReducedMotion ? '100vh' : '500vh',
        backgroundColor: '#FFFFFF',
        fontFamily: 'var(--font-display, "Outfit", sans-serif)'
      }}
    >
      {/* Invisible snap anchor points for native browser scroll-snap assist */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-screen w-full" />
        <div className="h-screen w-full" />
        <div className="h-screen w-full" />
        <div className="h-screen w-full" />
        <div className="h-screen w-full" />
      </div>

      {/* TOP HEADER: Brand Logo Badge, Stage Counter, and Skip to Home Action */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-5 sm:py-6 bg-white/85 backdrop-blur-md border-b border-slate-100/80 transition-all pointer-events-auto">
        {/* Left: Authentic Sportlink Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#DC2626] via-rose-600 to-[#15803D] text-white flex items-center justify-center font-black shadow-md shadow-red-500/20 ring-2 ring-white">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-['Outfit'] font-black uppercase text-lg sm:text-xl tracking-wider text-slate-900">
            Sport<span className="text-[#DC2626]">link</span>
          </span>
        </div>

        {/* Center: Active Stage Counter */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/60">
          <span
            ref={stageNumberRef}
            className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500"
          >
            01 / 05
          </span>
        </div>

        {/* Right: Accessible "Skip to Home" Action */}
        <button
          type="button"
          onClick={proceedToHomepage}
          className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#DC2626]"
          aria-label="Skip intro and go directly to platform home"
        >
          <span>Skip to Home</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Persistent Top Scroll Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-100 z-50 pointer-events-none">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-[#15803D] via-[#DC2626] to-[#1D4ED8] transition-all duration-75"
          style={{ width: '0%' }}
        />
      </div>

      {/* RIGHT SIDE: Interactive Vertical Stage Navigation Dots */}
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
                    ? 'w-2.5 h-8 bg-slate-900 shadow-sm'
                    : 'w-2 h-2 bg-slate-300 group-hover:bg-slate-500 group-hover:scale-125'
                }`}
              />
              <span className="absolute right-6 px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-mono font-bold tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                0{idx + 1}
              </span>
            </button>
          );
        })}
      </nav>

      {/* STICKY FULLSCREEN STAGE CANVAS */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white flex items-center justify-center px-4 sm:px-8 pointer-events-none">
        
        {/* =========================================================================
            STAGES 1 - 4: ATTRACTIVE TWO-LINE BOLD HEADLINES WITH SMOOTH SCROLL MOTION
            ========================================================================= */}
        {STAGES.map((stage, idx) => (
          <div
            key={stage.id}
            ref={(el) => (stageRefs.current[idx] = el)}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8 will-change-transform pointer-events-none"
            style={{
              transform: idx === 0 ? 'translate3d(0, 0, 0)' : 'translate3d(125%, 0, 0)',
              opacity: idx === 0 ? 1 : 0,
              visibility: idx === 0 ? 'visible' : 'hidden'
            }}
          >
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
              {/* Bold, Cinematic Two-Line Stacked Headline on ALL Devices */}
              <h1
                className="font-['Outfit'] font-black uppercase tracking-tight md:tracking-tighter text-center leading-[0.98] sm:leading-[0.95] drop-shadow-sm select-none"
                style={{
                  color: stage.textColor,
                  fontSize: 'clamp(2.75rem, 7.2vw, 6.4rem)'
                }}
              >
                <span className="block whitespace-nowrap">{stage.line1}</span>
                <span className="block whitespace-nowrap mt-2 sm:mt-3 md:mt-4">{stage.line2}</span>
              </h1>
            </div>
          </div>
        ))}

        {/* =========================================================================
            STAGE 5: FINAL SPORTLINK BRAND REVEAL (1.2S DELAY -> HOMEPAGE)
            ========================================================================= */}
        <div
          ref={brandRevealRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-8 will-change-transform pointer-events-none"
          style={{
            transform: 'translate3d(0, 45px, 0) scale(0.92)',
            opacity: 0,
            visibility: 'hidden'
          }}
        >
          {/* Subtle Red/Green Glow */}
          <div
            className="absolute w-[450px] sm:w-[600px] h-[300px] rounded-full blur-[100px] pointer-events-none -z-10"
            style={{
              background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, rgba(21,128,61,0.06) 100%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />

          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-6 sm:space-y-8">
            {/* Original Sportlink Logo Badge */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#DC2626] via-rose-600 to-[#15803D] text-white flex items-center justify-center font-black shadow-[0_16px_40px_rgba(220,38,38,0.28)] ring-4 ring-white transition-transform">
                <Zap className="w-11 h-11 sm:w-14 sm:h-14 fill-current drop-shadow-md" />
              </div>
            </div>

            {/* Brand Wordmark in Sportlink Brand Red & Official Motto in Established Green */}
            <div className="space-y-3 sm:space-y-4">
              <h1
                className="font-['Outfit'] font-black uppercase tracking-tight sm:tracking-tighter leading-none"
                style={{
                  color: '#DC2626',
                  fontSize: 'clamp(3.2rem, 10vw, 7.5rem)'
                }}
              >
                Sportlink
              </h1>

              <p
                className="font-['Plus_Jakarta_Sans'] font-semibold tracking-wide"
                style={{
                  color: '#15803D',
                  fontSize: 'clamp(1.1rem, 2.6vw, 1.75rem)'
                }}
              >
                &ldquo;Your Game. Your Ground. Your Opportunity.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Ambient Bottom Scroll Cue (Clickable, Fades out as user scrolls) */}
        <div
          ref={scrollHelperRef}
          onClick={() => scrollToStage(activeStage < 4 ? activeStage + 1 : 4)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold uppercase tracking-widest pointer-events-auto transition-all cursor-pointer group"
          title="Click or scroll to advance"
        >
          <span className="group-hover:translate-y-[-1px] transition-transform">Scroll or Click to Advance</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-slate-500 group-hover:text-slate-900" />
        </div>

      </div>

      {/* Reduced-Motion Alternate Layout Fallback */}
      {prefersReducedMotion && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#15803D] text-white flex items-center justify-center shadow-lg">
            <Zap className="w-9 h-9 fill-current" />
          </div>
          <h1 className="text-4xl font-black text-[#DC2626] font-['Outfit'] uppercase">
            Sportlink
          </h1>
          <p className="text-lg font-semibold text-[#15803D] font-['Plus_Jakarta_Sans']">
            &ldquo;Your Game. Your Ground. Your Opportunity.&rdquo;
          </p>
          <button
            type="button"
            onClick={proceedToHomepage}
            className="px-6 py-3 rounded-xl bg-[#DC2626] text-white font-black text-sm uppercase tracking-wider hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
          >
            Enter Sportlink Platform
          </button>
        </div>
      )}
    </div>
  );
}
