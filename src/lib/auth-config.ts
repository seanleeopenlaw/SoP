/**
 * Authentication Configuration
 *
 * Centralized configuration for authentication and authorization.
 * Admin emails are stored in environment variables for easy management.
 */

/**
 * Get list of admin emails from environment variable
 */
export function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';

  return adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

/**
 * Check if an email is an admin
 */
export function isAdminEmail(email: string): boolean {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();
  const adminEmails = getAdminEmails();

  return adminEmails.includes(normalizedEmail);
}

/**
 * Session configuration
 */
export const SESSION_CONFIG = {
  // Session timeout in hours (24 hours)
  TIMEOUT_HOURS: 24,

  // Session storage key
  STORAGE_KEY: 'auth_session',
} as const;

/**
 * Get default admin email (for backwards compatibility)
 */
export function getDefaultAdminEmail(): string {
  const adminEmails = getAdminEmails();
  return adminEmails[0] || 'admin@openlaw.com.au';
}
