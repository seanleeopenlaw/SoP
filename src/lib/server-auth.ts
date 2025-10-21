/**
 * Server-side Authentication Utilities
 *
 * Basic server-side session validation.
 *
 * ⚠️ IMPORTANT: This is a demo implementation using headers.
 * For production, implement proper JWT tokens, httpOnly cookies, or server-side sessions.
 */

import { SESSION_CONFIG } from './auth-config';
import { headers } from 'next/headers';

export interface ServerSession {
  email: string;
  name: string;
  isAdmin: boolean;
}

/**
 * Verify session from request headers
 *
 * Checks for X-User-Email and X-User-Admin headers sent by client.
 *
 * ⚠️ This is NOT production-grade security.
 * Implement proper JWT or server-side sessions for production.
 */
export async function verifySession(request?: Request): Promise<ServerSession | null> {
  try {
    // Get headers from Next.js context or request
    const headersList = request
      ? new Headers(request.headers)
      : await headers();

    const email = headersList.get('x-user-email');
    const name = headersList.get('x-user-name');
    const isAdmin = headersList.get('x-user-admin') === 'true';

    if (!email || !name) {
      return null;
    }

    return {
      email: email.toLowerCase().trim(),
      name,
      isAdmin,
    };
  } catch (error) {
    console.error('[Server Auth] Error verifying session:', error);
    return null;
  }
}

/**
 * Verify admin access
 */
export async function verifyAdminAccess(request?: Request): Promise<boolean> {
  const session = await verifySession(request);

  if (!session || !session.isAdmin) {
    return false;
  }

  // Additional check: verify email is in admin list
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  return adminEmails.includes(session.email);
}

/**
 * Create headers for authenticated requests (client-side utility)
 */
export function createAuthHeaders(session: { email: string; name: string; isAdmin: boolean }): Headers {
  const headers = new Headers();
  headers.set('x-user-email', session.email);
  headers.set('x-user-name', session.name);
  headers.set('x-user-admin', session.isAdmin.toString());
  return headers;
}
