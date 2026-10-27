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

  // Synchronize body background with current route
  useEffect(() => {
    if (isFacilitiesPage) {
      document.body.style.backgroundImage = "linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('/facilities-bg.jpg')";
      document.body.style.backgroundColor = '#181b22';
    } else if (isTournamentsPage) {
      document.body.style.backgroundImage = "linear-gradient(rgba(11, 15, 20, 0.35), rgba(11, 15, 20, 0.35)), url('/tournaments-bg.jpg')";
      document.body.style.backgroundColor = '#0b0f14';
    } else {
      document.body.style.backgroundImage = "url('/football-pitch-bg.svg')";
      document.body.style.backgroundColor = '#227b28';
    }
  }, [isFacilitiesPage, isTournamentsPage]);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-[#c6ff3d] selection:text-[#0a1020] relative">
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
