/**
 * CompareContext.jsx
 * Global context managing facility comparison selection persisted in sessionStorage.
 *
 * Rules:
 *  - Stores facility IDs only (never private data).
 *  - Max 4 facilities on desktop, 3 on mobile.
 *  - Exposes: selectedIds, isComparing(id), toggleCompare(id), removeFromCompare(id), clearCompare().
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'sportlink_compare_facility_ids';
const MAX_DESKTOP = 4;
const MAX_MOBILE = 3;

const CompareContext = createContext(null);

export function CompareProvider({ children, onShowToast }) {
  const [selectedIds, setSelectedIds] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Sync to sessionStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
      }
    } catch {
      // ignore
    }
  }, [selectedIds]);

  const isComparing = useCallback((id) => selectedIds.includes(id), [selectedIds]);

  const toggleCompare = useCallback(
    (id, facilityName = 'Facility') => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        }

        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const limit = isMobile ? MAX_MOBILE : MAX_DESKTOP;

        if (prev.length >= limit) {
          if (onShowToast) {
            onShowToast({
              title: 'Comparison Limit Reached',
              message: `You can compare up to ${limit} facilities at once. Remove one to add ${facilityName}.`,
              type: 'warning',
              isDemo: true
            });
          }
          return prev;
        }

        return [...prev, id];
      });
    },
    [onShowToast]
  );

  const removeFromCompare = useCallback((id) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        selectedIds,
        compareCount: selectedIds.length,
        isComparing,
        toggleCompare,
        removeFromCompare,
        clearCompare
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    // Return safe fallback if mounted outside provider
    return {
      selectedIds: [],
      compareCount: 0,
      isComparing: () => false,
      toggleCompare: () => {},
      removeFromCompare: () => {},
      clearCompare: () => {}
    };
  }
  return ctx;
}

