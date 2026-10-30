/**
 * AuthContext.jsx
 * Global authentication context. Wraps the entire app (added in main.jsx).
 * Components read: currentUser, isAuthenticated, authLoading
 * Components call: login(), register(), logout()
 *
 * The password hash is NEVER placed into context. Only sanitized user objects
 * (id, name, email, role, createdAt) are stored here.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as svcLogin, register as svcRegister, logout as svcLogout, restoreSession } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // true while restoring session

  // Restore session on mount (runs once)
  useEffect(() => {
    const user = restoreSession();
    setCurrentUser(user);
    setAuthLoading(false);
  }, []);

  /**
   * Log in. Returns { success, error?, fieldErrors? }
   * On success, currentUser is set automatically.
   */
  const login = useCallback(async (credentials) => {
    const result = await svcLogin(credentials);
    if (result.success) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  /**
   * Register. Returns { success, error?, fieldErrors? }
   * On success, user is automatically logged in (currentUser set).
   */
  const register = useCallback(async (data) => {
    const result = await svcRegister(data);
    if (result.success) {
      setCurrentUser(result.user);
    }
    return result;
  }, []);

  /**
   * Log out. Clears session and resets currentUser.
   */
  const logout = useCallback(() => {
    svcLogout();
    setCurrentUser(null);
  }, []);

  const isAuthenticated = Boolean(currentUser);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

