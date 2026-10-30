import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from './Toast';
import { CompareProvider } from '../context/CompareContext';
import FloatingCompareBar from './facility/FloatingCompareBar';
import { INITIAL_FACILITIES } from '../data/facilitiesData';

export default function Layout() {
  const [toast, setToast] = useState(null);
  const location = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const showToast = (toastData) => {
    setToast(toastData);
  };

  const closeToast = () => {
    setToast(null);
  };

  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const facilitiesBg = `${cleanBase}facilities-bg.jpg`;
  const tournamentsBg = `${cleanBase}tournaments-bg.jpg`;
  const friendliesBg = `${cleanBase}friendlies-bg.jpg`;
  const coachingBg = `${cleanBase}coaching-bg.jpg`;
  const trialsBg = `${cleanBase}trials-bg.jpg`;
  const pitchBg = `${cleanBase}football-pitch-bg.svg`;

  const isFacilitiesPage = location.pathname.startsWith('/facilities');
  const isTournamentsPage = location.pathname.startsWith('/tournaments');
  const isFriendliesPage = location.pathname.startsWith('/friendlies') || location.pathname.startsWith('/friendly-matches');
  const isCoachingPage = location.pathname.startsWith('/coaching');
  const isTrialsPage = location.pathname.startsWith('/trials');

  // Synchronize body background with current route
  useEffect(() => {
    if (isFacilitiesPage) {
      document.body.style.backgroundImage = `linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('${facilitiesBg}')`;
      document.body.style.backgroundColor = '#181b22';
    } else if (isTournamentsPage) {
      document.body.style.backgroundImage = `linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('${tournamentsBg}')`;
      document.body.style.backgroundColor = '#0b0f14';
    } else if (isFriendliesPage) {
      document.body.style.backgroundImage = `linear-gradient(rgba(6, 10, 18, 0.35), rgba(5, 8, 15, 0.60)), url('${friendliesBg}')`;
      document.body.style.backgroundColor = '#060a12';
    } else if (isCoachingPage) {
      document.body.style.backgroundImage = `linear-gradient(rgba(10, 8, 14, 0.40), rgba(7, 5, 10, 0.65)), url('${coachingBg}')`;
      document.body.style.backgroundColor = '#07050a';
    } else if (isTrialsPage) {
      document.body.style.backgroundImage = `linear-gradient(rgba(10, 12, 18, 0.45), rgba(7, 8, 14, 0.70)), url('${trialsBg}')`;
      document.body.style.backgroundColor = '#080a10';
    } else {
      document.body.style.backgroundImage = `url('${pitchBg}')`;
      document.body.style.backgroundColor = '#227b28';
    }
  }, [isFacilitiesPage, isTournamentsPage, isFriendliesPage, isCoachingPage, isTrialsPage, facilitiesBg, tournamentsBg, friendliesBg, coachingBg, trialsBg, pitchBg]);

  return (
    <CompareProvider onShowToast={showToast}>
      <div className={`min-h-screen bg-transparent text-slate-100 flex flex-col font-sans relative ${
      isFacilitiesPage
        ? 'selection:bg-rose-600/40 selection:text-white'
        : isFriendliesPage
        ? 'selection:bg-sky-500/35 selection:text-white'
        : isCoachingPage
        ? 'selection:bg-red-600/40 selection:text-white'
        : isTrialsPage
        ? 'selection:bg-amber-500/40 selection:text-white'
        : 'selection:bg-[#c6ff3d] selection:text-[#0a1020]'
    }`}>
      {/* Dynamic Route-Aware Fixed Background */}
      {isFacilitiesPage ? (
        <div
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('${facilitiesBg}')`
          }}
          aria-hidden="true"
        />
      ) : isTournamentsPage ? (
        <div
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('${tournamentsBg}')`
          }}
          aria-hidden="true"
        />
      ) : isFriendliesPage ? (
        <div
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 10, 18, 0.35), rgba(5, 8, 15, 0.60)), url('${friendliesBg}')`
          }}
          aria-hidden="true"
        />
      ) : isCoachingPage ? (
        <div
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(rgba(10, 8, 14, 0.40), rgba(7, 5, 10, 0.65)), url('${coachingBg}')`
          }}
          aria-hidden="true"
        />
      ) : isTrialsPage ? (
        <div
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: `linear-gradient(rgba(10, 12, 18, 0.45), rgba(7, 8, 14, 0.70)), url('${trialsBg}')`
          }}
          aria-hidden="true"
        />
      ) : (
        <div
          className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: `url('${pitchBg}')`
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar onShowToast={showToast} />

      <main className="flex-1 relative z-0">
        <Outlet context={{ showToast }} />
      </main>

      <Footer />

      <FloatingCompareBar facilitiesList={INITIAL_FACILITIES} />

      <Toast toast={toast} onClose={closeToast} />
      </div>
    </div>
  </CompareProvider>
);
}
