import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getDatabaseState,
  saveDatabaseState,
  facilityOwnerApi,
  OWNER_PERSONAS
} from '../services/facilityOwnerApi.js';

const FacilitiesContext = createContext(null);

export function FacilitiesProvider({ children }) {
  const [dbState, setDbState] = useState(() => getDatabaseState());
  const [role, setRole] = useState('owner'); // default to owner or player
  const [activeOwner, setActiveOwner] = useState(
    dbState.activeSession?.user || OWNER_PERSONAS[0]
  );

  // Sync session with active owner
  const session = {
    user: activeOwner,
    token: `token-${activeOwner.id}`
  };

  const refreshData = useCallback(() => {
    setDbState(getDatabaseState());
  }, []);

  // Switch demo owner persona (for testing multi-tenant isolation)
  const switchOwnerPersona = (ownerId) => {
    const found = OWNER_PERSONAS.find((o) => o.id === ownerId) || OWNER_PERSONAS[0];
    setActiveOwner(found);
  };

  // --- API WRAPPERS ENFORCING SERVER-SIDE SECURITY ---

  const handleCreateFacility = async (facilityData) => {
    const res = facilityOwnerApi.createFacility(session, facilityData);
    refreshData();
    return res;
  };

  const handleUpdateFacility = async (facilityId, updates) => {
    const res = facilityOwnerApi.updateFacility(session, facilityId, updates);
    refreshData();
    return res;
  };

  const handleToggleFacilityStatus = async (facilityId, status) => {
    const res = facilityOwnerApi.toggleFacilityStatus(session, facilityId, status);
    refreshData();
    return res;
  };

  const handleUpdateSlotOverride = async (slotConfig) => {
    const res = facilityOwnerApi.updateSlotOverride(session, slotConfig);
    refreshData();
    return res;
  };

  const handleUpdatePricing = async (facilityId, pricingData) => {
    const res = facilityOwnerApi.updateFacilityPricing(session, facilityId, pricingData);
    refreshData();
    return res;
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus, reason) => {
    const res = facilityOwnerApi.updateBookingStatus(session, bookingId, newStatus, reason);
    refreshData();
    return res;
  };

  const handleCreateBlockDate = async (blockData) => {
    const res = facilityOwnerApi.createBlockDate(session, blockData);
    refreshData();
    return res;
  };

  const handleDeleteBlockDate = async (blockId) => {
    const res = facilityOwnerApi.deleteBlockDate(session, blockId);
    refreshData();
    return res;
  };

  // Player booking submission (from Checkout flow)
  const handlePlayerBookingCreate = (newBooking) => {
    const current = getDatabaseState();
    const updatedBookings = [newBooking, ...current.bookings];
    const newPayment = {
      id: `pay-${Date.now()}`,
      bookingId: newBooking.id,
      facilityId: newBooking.facilityId,
      amount: newBooking.amount,
      currency: 'INR',
      status: 'captured',
      paymentMethod: 'UPI / Demo Card',
      transactionRef: `TXN-SPL-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString()
    };
    const updatedPayments = [newPayment, ...current.payments];
    const updatedDb = {
      ...current,
      bookings: updatedBookings,
      payments: updatedPayments
    };
    saveDatabaseState(updatedDb);
    setDbState(updatedDb);
  };

  const value = {
    // Current active data
    facilities: dbState.facilities,
    bookings: dbState.bookings,
    blockedDates: dbState.blockedDates || [],
    payments: dbState.payments || [],
    customSlotOverrides: dbState.customSlotOverrides || {},

    // Session & Role
    role,
    setRole,
    activeOwner,
    session,
    ownerPersonas: OWNER_PERSONAS,
    switchOwnerPersona,

    // API Handlers
    createFacility: handleCreateFacility,
    updateFacility: handleUpdateFacility,
    toggleFacilityStatus: handleToggleFacilityStatus,
    updateSlotOverride: handleUpdateSlotOverride,
    updatePricing: handleUpdatePricing,
    updateBookingStatus: handleUpdateBookingStatus,
    createBlockDate: handleCreateBlockDate,
    deleteBlockDate: handleDeleteBlockDate,
    createPlayerBooking: handlePlayerBookingCreate,
    refreshData
  };

  return (
    <FacilitiesContext.Provider value={value}>
      {children}
    </FacilitiesContext.Provider>
  );
}

export function useFacilities() {
  const context = useContext(FacilitiesContext);
  if (!context) {
    throw new Error('useFacilities must be used within a FacilitiesProvider');
  }
  return context;
}
