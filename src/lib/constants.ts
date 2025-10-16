/**
 * Application-wide constants
 * Centralized location for magic numbers and configuration values
 */

export const UI_CONSTANTS = {
  MODAL: {
    DEFAULT_OFFSET: 30,
    BASE_POSITION: { x: 100, y: 100 },
    BASE_Z_INDEX: 1000,
    Z_INDEX_INCREMENT: 10,
    MIN_WIDTH: 300,
    MIN_HEIGHT: 200,
    DEFAULT_WIDTH: 400,
    DEFAULT_HEIGHT: 300,
  },
  COLORS: {
    PRIMARY: '#3730a3',
    PRIMARY_HOVER: '#312e81',
  },
  FORM: {
    MAX_CORE_VALUES: 5,
    MAX_CHARACTER_STRENGTHS: 5,
    DEBOUNCE_DELAY: 500,
  },
  BIG_FIVE: {
    MIN_SCORE: 0,
    MAX_SCORE: 999,
    SCORE_STEP: 1,
  },
} as const;

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
