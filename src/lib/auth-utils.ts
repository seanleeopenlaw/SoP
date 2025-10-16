/**
 * Client-side Authentication Utilities
 *
 * Session management using sessionStorage (auto-clears on browser close).
 * Always validate session server-side for security.
 */

import { SESSION_CONFIG } from './auth-config';

export interface Session {
  email: string;
  name: string;
  isAdmin: boolean;
  expiresAt: number;
}

/**
 * Get current session from sessionStorage
 */
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;

  try {
    const sessionData = sessionStorage.getItem(SESSION_CONFIG.STORAGE_KEY);
    if (!sessionData) return null;

    const session: Session = JSON.parse(sessionData);

    // Check if session expired
    if (session.expiresAt < Date.now()) {
      clearSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error reading session:', error);
    clearSession();
    return null;
  }
}

/**
 * Save session to sessionStorage
 */
export function setSession(email: string, name: string, isAdmin: boolean): void {
  if (typeof window === 'undefined') return;

  const expiresAt = Date.now() + (SESSION_CONFIG.TIMEOUT_HOURS * 60 * 60 * 1000);

  const session: Session = {
    email: email.toLowerCase().trim(),
    name,
    isAdmin,
    expiresAt,
  };

  sessionStorage.setItem(SESSION_CONFIG.STORAGE_KEY, JSON.stringify(session));
}

/**
 * Clear session from sessionStorage
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_CONFIG.STORAGE_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Check if current user is admin
 */
export function isAdminUser(): boolean {
  const session = getSession();
  return session?.isAdmin === true;
}

/**
 * Get current user email
 */
export function getCurrentUserEmail(): string | null {
  const session = getSession();
  return session?.email || null;
}

/**
 * Get current user name
 */
export function getCurrentUserName(): string | null {
  const session = getSession();
  return session?.name || null;
}
