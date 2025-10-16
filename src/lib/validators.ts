import { VALIDATION } from './constants';

/**
 * Validates email format using a standard regex pattern
 * @param email - Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * Normalizes an email address to lowercase and trims whitespace
 * @param email - Email address to normalize
 * @returns Normalized email address
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Type guard for Chronotype values
 * @param type - Value to check
 * @returns true if value is a valid chronotype
 */
export function isValidChronotype(
  type: any
): type is 'Lion' | 'Bear' | 'Wolf' | 'Dolphin' {
  return ['Lion', 'Bear', 'Wolf', 'Dolphin'].includes(type);
}
