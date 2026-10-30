import React, { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CalendarDays,
  Tag,
  BookmarkCheck,
  Ban,
  Star,
  DollarSign,
  BarChart3,
  Menu,
  X,
  ShieldCheck,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { useFacilities } from '../../context/FacilitiesContext.jsx';
import Button from '../../components/Button.jsx';

export default function OwnerLayout() {
  const { role, setRole, activeOwner, ownerPersonas, switchOwnerPersona } = useFacilities();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/owner', icon: LayoutDashboard, exact: true },
    { label: 'My Facilities', path: '/owner/facilities', icon: Building2 },
    { label: 'Add Facility', path: '/owner/add-facility', icon: PlusCircle },
    { label: 'Manage Slots', path: '/owner/slots', icon: CalendarDays },
    { label: 'Manage Pricing', path: '/owner/pricing', icon: Tag },
    { label: 'Bookings', path: '/owner/bookings', icon: BookmarkCheck },
    { label: 'Block Dates', path: '/owner/blocks', icon: Ban },
    { label: 'Reviews', path: '/owner/reviews', icon: Star },
    { label: 'Earnings', path: '/owner/earnings', icon: DollarSign },
    { label: 'Analytics', path: '/owner/analytics', icon: BarChart3 }
  ];

  // If role is player, show strict access guard
  if (role !== 'owner') {
    return (
      <div className="py-16 sm:py-24 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#141B24] border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Access Restricted
          </span>
          <h1 className="font-['Barlow_Condensed'] text-4xl font-black uppercase text-[#F5F7FA]">
            Facility Owner Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            This section is reserved for verified sports venue owners. You are currently viewing SportLink in the Player persona.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="gold"
            size="md"
            onClick={() => setRole('owner')}
            className="gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Switch to Facility Owner Role</span>
          </Button>

          <Link to="/facilities">
            <Button variant="outline" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to Public Facilities</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-hero-fade">
      {/* Top Banner: Persona Switcher & Back Link */}
      <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/facilities"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#94A3B8] hover:text-[#E5C378] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Directory</span>
          </Link>
          <span className="text-[#293442]">|</span>
          <span className="text-xs font-bold uppercase text-[#E5C378] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Facility Owner Portal</span>
          </span>
        </div>

        {/* Multi-Tenant Persona Testing Switcher */}
        <div className="flex items-center gap-2">
          <label htmlFor="owner-persona-select" className="text-[11px] font-bold text-[#94A3B8] uppercase">
            Active Owner:
          </label>
          <select
            id="owner-persona-select"
            value={activeOwner.id}
            onChange={(e) => switchOwnerPersona(e.target.value)}
            className="bg-[#0B0F14] border border-[#293442] text-xs font-bold text-[#F5F7FA] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
          >
            {ownerPersonas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.company.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Layout Grid: Sidebar (Desktop) + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mobile Nav Toggle */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-[#141B24] border border-[#293442] rounded-xl text-xs font-bold text-[#F5F7FA]"
          >
            <span className="flex items-center gap-2">
              <Menu className="w-4 h-4 text-[#E5C378]" />
              <span>Dashboard Menu</span>
            </span>
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {mobileMenuOpen && (
            <div className="mt-2 bg-[#141B24] border border-[#293442] rounded-xl p-2 space-y-1 shadow-2xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] shadow-sm'
                        : 'text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#0B0F14]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
          <div className="bg-[#141B24] border border-[#293442] rounded-2xl p-4 shadow-xl space-y-1">
            <div className="pb-3 px-2 border-b border-[#293442]">
              <div className="text-xs font-bold text-[#F5F7FA]">{activeOwner.name}</div>
              <div className="text-[11px] text-[#94A3B8] truncate">{activeOwner.company}</div>
            </div>

            <nav className="pt-2 space-y-1" aria-label="Owner dashboard navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#0F141C] shadow-md'
                        : 'text-[#94A3B8] hover:text-[#F5F7FA] hover:bg-[#0B0F14]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Section Content Outlet */}
        <main className="lg:col-span-9 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
