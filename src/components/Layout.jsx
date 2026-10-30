import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Toast from './Toast';

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

  const isFacilitiesPage = location.pathname.startsWith('/facilities');
  const isTournamentsPage = location.pathname.startsWith('/tournaments');
  const isFriendliesPage = location.pathname.startsWith('/friendlies') || location.pathname.startsWith('/friendly-matches');
  const isCoachingPage = location.pathname.startsWith('/coaching');
  const isTrialsPage = location.pathname.startsWith('/trials');

  // Synchronize body background with current route
  useEffect(() => {
    if (isFacilitiesPage) {
      document.body.style.backgroundImage = "linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('/facilities-bg.jpg')";
      document.body.style.backgroundColor = '#181b22';
    } else if (isTournamentsPage) {
      document.body.style.backgroundImage = "linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('/tournaments-bg.jpg')";
      document.body.style.backgroundColor = '#0b0f14';
    } else if (isFriendliesPage) {
      document.body.style.backgroundImage = "linear-gradient(rgba(6, 10, 18, 0.35), rgba(5, 8, 15, 0.60)), url('/friendlies-bg.jpg')";
      document.body.style.backgroundColor = '#060a12';
    } else if (isCoachingPage) {
      document.body.style.backgroundImage = "linear-gradient(rgba(10, 8, 14, 0.40), rgba(7, 5, 10, 0.65)), url('/coaching-bg.jpg')";
      document.body.style.backgroundColor = '#07050a';
    } else if (isTrialsPage) {
      document.body.style.backgroundImage = "linear-gradient(rgba(10, 12, 18, 0.45), rgba(7, 8, 14, 0.70)), url('/trials-bg.jpg')";
      document.body.style.backgroundColor = '#080a10';
    } else {
      document.body.style.backgroundImage = "url('/football-pitch-bg.svg')";
      document.body.style.backgroundColor = '#227b28';
    }
  }, [isFacilitiesPage, isTournamentsPage, isFriendliesPage, isCoachingPage, isTrialsPage]);

  return (
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
          className="fixed inset-0 -z-50 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('/facilities-bg.jpg')"
          }}
          aria-hidden="true"
        />
      ) : isTournamentsPage ? (
        <div
          className="fixed inset-0 -z-50 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('/tournaments-bg.jpg')"
          }}
          aria-hidden="true"
        />
      ) : isFriendliesPage ? (
        <div
          className="fixed inset-0 -z-50 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(rgba(6, 10, 18, 0.35), rgba(5, 8, 15, 0.60)), url('/friendlies-bg.jpg')"
          }}
          aria-hidden="true"
        />
      ) : isCoachingPage ? (
        <div
          className="fixed inset-0 -z-50 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(rgba(10, 8, 14, 0.40), rgba(7, 5, 10, 0.65)), url('/coaching-bg.jpg')"
          }}
          aria-hidden="true"
        />
      ) : isTrialsPage ? (
        <div
          className="fixed inset-0 -z-50 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(rgba(10, 12, 18, 0.45), rgba(7, 8, 14, 0.70)), url('/trials-bg.jpg')"
          }}
          aria-hidden="true"
        />
      ) : (
        <div
          className="fixed inset-0 -z-50 pointer-events-none bg-[url('/football-pitch-bg.svg')] bg-cover bg-center bg-no-repeat transition-all duration-300"
          aria-hidden="true"
        />
      )}

      <Navbar onShowToast={showToast} />

      <main className="flex-1 relative z-0">
        <Outlet context={{ showToast }} />
      </main>

      <Footer />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
