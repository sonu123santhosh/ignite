/**
 * AuthCard.jsx
 * High-performance, sports-themed glassmorphic wrapper for Login and Register pages.
 * Supports distinct sport atmospheres (Football Turf vs Athletic Arena/Court),
 * animated stadium floodlights, tactical pitch/track SVG overlays, and true frosted glass.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function AuthCard({
  children,
  title,
  titleHighlight,
  subtitle,
  sport = 'football' // 'football' | 'athletics'
}) {
  const isFootball = sport === 'football';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden ${
      isFootball ? 'selection:bg-emerald-500/30 selection:text-white' : 'selection:bg-cyan-500/30 selection:text-white'
    }`}>
      {/* =========================================================================
          TOP LEFT: Natural Human-Made Back to Home Link
          ========================================================================= */}
      <Link
        to="/home"
        className="fixed top-6 left-6 sm:top-8 sm:left-8 z-30 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group cursor-pointer"
        aria-label="Back to home"
      >
        <span className={`text-slate-400 transition-all duration-200 text-base leading-none group-hover:-translate-x-1 ${
          isFootball ? 'group-hover:text-emerald-400' : 'group-hover:text-cyan-400'
        }`}>
          ←
        </span>
        <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
          Back to home
        </span>
      </Link>

      {/* =========================================================================
          BACKGROUND LAYER: Distinct Sports Photo + Vignette
          ========================================================================= */}
      <div
        className="fixed inset-0 -z-50 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none scale-105"
        style={{
          backgroundImage: isFootball
            ? "linear-gradient(rgba(7, 13, 22, 0.45), rgba(5, 9, 16, 0.75)), url('/facilities-bg.jpg')"
            : "linear-gradient(rgba(10, 8, 20, 0.40), rgba(6, 5, 14, 0.72)), url('/trials-bg.jpg')",
          backgroundColor: isFootball ? '#070d18' : '#0d0b16'
        }}
      />

      {/* Atmospheric dark sports vignette */}
      <div className="fixed inset-0 -z-40 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.15)_0%,rgba(5,8,15,0.85)_100%)]" />

      {/* =========================================================================
          ANIMATION LAYER: Correlated Sports Elements (Pitch vs Court)
          ========================================================================= */}
      {isFootball ? (
        /* SPORT 1: FOOTBALL TURF ARENA ANIMATIONS (Rich Emerald & Teal Palette) */
        <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
          {/* Sweeping Stadium Night Floodlight Beam */}
          <div className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl animate-stadium-floodlight" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-gradient-to-tl from-teal-500/20 via-emerald-500/10 to-transparent rounded-full blur-3xl animate-stadium-floodlight" style={{ animationDelay: '-7s' }} />

          {/* Glowing Football Pitch Tactical SVG Lines (Athletic Emerald Turf) */}
          <svg
            className="absolute inset-0 w-full h-full opacity-35 animate-sports-pulse"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="turfGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Field Boundary Outline */}
            <rect x="80" y="60" width="1040" height="680" fill="none" stroke="url(#turfGlow)" strokeWidth="2" strokeDasharray="12 8" />
            
            {/* Halfway Line & Center Circle */}
            <line x1="600" y1="60" x2="600" y2="740" stroke="url(#turfGlow)" strokeWidth="2" />
            <circle cx="600" cy="400" r="110" fill="none" stroke="url(#turfGlow)" strokeWidth="2" />
            <circle cx="600" cy="400" r="5" fill="#10B981" />

            {/* Left Penalty Box & Goal Arc */}
            <rect x="80" y="240" width="190" height="320" fill="none" stroke="url(#turfGlow)" strokeWidth="1.5" />
            <rect x="80" y="320" width="70" height="160" fill="none" stroke="url(#turfGlow)" strokeWidth="1.5" />
            <path d="M 270 340 A 70 70 0 0 1 270 460" fill="none" stroke="url(#turfGlow)" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* Right Penalty Box & Goal Arc */}
            <rect x="930" y="240" width="190" height="320" fill="none" stroke="url(#turfGlow)" strokeWidth="1.5" />
            <rect x="1050" y="320" width="70" height="160" fill="none" stroke="url(#turfGlow)" strokeWidth="1.5" />
            <path d="M 930 340 A 70 70 0 0 0 930 460" fill="none" stroke="url(#turfGlow)" strokeWidth="1.5" strokeDasharray="6 6" />

            {/* Corner Arcs */}
            <path d="M 80 85 A 25 25 0 0 0 105 60" fill="none" stroke="#10B981" strokeWidth="2" />
            <path d="M 1120 85 A 25 25 0 0 1 1095 60" fill="none" stroke="#10B981" strokeWidth="2" />
            <path d="M 80 715 A 25 25 0 0 1 105 740" fill="none" stroke="#10B981" strokeWidth="2" />
            <path d="M 1120 715 A 25 25 0 0 0 1095 740" fill="none" stroke="#10B981" strokeWidth="2" />
          </svg>

          {/* Floating subtle sports energy glints */}
          <div className="absolute top-1/4 left-16 w-2 h-2 rounded-full bg-emerald-400 blur-[1px] animate-subtle-float" />
          <div className="absolute bottom-1/3 right-20 w-3 h-3 rounded-full bg-teal-400 blur-[2px] animate-subtle-float" style={{ animationDelay: '-2s' }} />
        </div>
      ) : (
        /* SPORT 2: ATHLETIC TRACK & COURT ARENA ANIMATIONS (Electric Cyan & Amber) */
        <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
          {/* Sweeping Arena Cyan & Amber Spotlight Beam */}
          <div className="absolute -top-32 -right-32 w-[650px] h-[650px] bg-gradient-to-bl from-cyan-400/20 via-sky-500/10 to-transparent rounded-full blur-3xl animate-court-floodlight" />
          <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl animate-court-floodlight" style={{ animationDelay: '-8s' }} />

          {/* Dynamic Running Track & Basketball Court SVG Geometry */}
          <svg
            className="absolute inset-0 w-full h-full opacity-35 animate-sports-pulse"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="trackGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Curved Athletic Running Track Lanes */}
            <path d="M 0 180 C 450 180, 750 350, 1200 350" fill="none" stroke="url(#trackGlow)" strokeWidth="2" strokeDasharray="10 8" />
            <path d="M 0 230 C 450 230, 750 400, 1200 400" fill="none" stroke="url(#trackGlow)" strokeWidth="2" strokeDasharray="14 10" />
            <path d="M 0 280 C 450 280, 750 450, 1200 450" fill="none" stroke="url(#trackGlow)" strokeWidth="2" strokeDasharray="18 12" />
            <path d="M 0 330 C 450 330, 750 500, 1200 500" fill="none" stroke="url(#trackGlow)" strokeWidth="2" />

            {/* Basketball Free Throw Key & 3-Point Arc */}
            <rect x="480" y="520" width="240" height="280" fill="none" stroke="#00D4FF" strokeWidth="2" strokeDasharray="8 6" opacity="0.6" />
            <circle cx="600" cy="520" r="75" fill="none" stroke="#00D4FF" strokeWidth="2" opacity="0.7" />
            <path d="M 360 800 C 360 620, 840 620, 840 800" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="12 8" opacity="0.65" />

            {/* Track Sprint Lane Stagger Marks */}
            <line x1="160" y1="165" x2="160" y2="345" stroke="#00D4FF" strokeWidth="2" />
            <line x1="240" y1="170" x2="240" y2="350" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          {/* Floating athletic radar glints */}
          <div className="absolute top-1/3 right-24 w-2.5 h-2.5 rounded-full bg-[#00D4FF] blur-[1px] animate-subtle-float" />
          <div className="absolute bottom-1/4 left-24 w-3 h-3 rounded-full bg-amber-400 blur-[2px] animate-subtle-float" style={{ animationDelay: '-2.5s' }} />
        </div>
      )}

      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 mb-6 group z-10">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center text-white font-black shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-transform duration-300 group-hover:scale-105">
          <Zap className="w-6 h-6 fill-current text-white" />
        </div>
        <span className="font-['Barlow_Condensed'] text-3xl font-black tracking-wider uppercase text-white leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          Sport<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Link</span>
        </span>
      </Link>

      {/* =========================================================================
          TRANSPARENT BOX EFFECT: Ultra-Frosted Glassmorphism Card
          ========================================================================= */}
      <div
        className="w-full max-w-md rounded-3xl p-7 sm:p-9 space-y-6 relative z-10 transition-all duration-300 animate-hero-fade backdrop-blur-2xl"
        style={{
          background: isFootball
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 25%, rgba(10, 22, 28, 0.60) 60%, rgba(6, 14, 18, 0.80) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 25%, rgba(18, 14, 28, 0.58) 60%, rgba(10, 8, 18, 0.78) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderTop: '1px solid rgba(255, 255, 255, 0.38)',
          boxShadow: isFootball
            ? '0 25px 60px -10px rgba(0,0,0,0.85), 0 0 35px -5px rgba(16,185,129,0.18), inset 0 1px 1px 0 rgba(255,255,255,0.25)'
            : '0 25px 60px -10px rgba(0,0,0,0.85), 0 0 35px -5px rgba(0,212,255,0.16), inset 0 1px 1px 0 rgba(255,255,255,0.25)'
        }}
      >
        {/* Subtle glass reflection highlight streak */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Card Header with Uniform Barlow Condensed Typography */}
        <div className="text-center space-y-2">
          <h1 className="font-['Barlow_Condensed'] text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-none">
            {title}{' '}
            {titleHighlight && (
              <span className={`text-transparent bg-clip-text ${
                isFootball
                  ? 'bg-gradient-to-r from-white via-emerald-100 to-emerald-400'
                  : 'bg-gradient-to-r from-white via-cyan-100 to-[#00D4FF]'
              }`}>
                {titleHighlight}
              </span>
            )}
          </h1>

          {subtitle && (
            <p className="font-['Barlow_Condensed'] text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300 max-w-sm mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form Body */}
        {children}
      </div>

      {/* Footer subtle brand tagline */}
      <p className="mt-8 text-xs font-['Barlow_Condensed'] uppercase tracking-widest text-slate-400/80 z-10 text-center">
        Your Game. Your Ground. Your Opportunity.
      </p>
    </div>
  );
}
