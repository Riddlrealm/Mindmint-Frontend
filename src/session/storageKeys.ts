/**
 * Centralized list of localStorage keys used across the app.
 *
 * Keep this file in sync with the keys cleared inside clearSession().
 */

export const STORAGE_KEYS = {
  TOKEN: 'mindmint_token',
  USER: 'mindmint_user',
  USER_PROFILE: 'mindmint_user_profile',
  ACCOUNT_SETTINGS: 'mindmint_account_settings',
  NOTIFICATION_SCHEDULE: 'mindmint_notification_schedule',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
