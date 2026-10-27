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

  return (
    <div className="min-h-screen bg-[#0a1020] text-slate-100 flex flex-col font-sans selection:bg-[#c6ff3d] selection:text-[#0a1020]">
      <Navbar onShowToast={showToast} />

      <main className="flex-1">
        <Outlet context={{ showToast }} />
      </main>

      <Footer />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
