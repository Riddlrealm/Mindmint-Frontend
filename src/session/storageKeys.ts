/**
 * Centralized list of localStorage keys used across the app.
 *
 * Keep this file in sync with the keys cleared inside clearSession().
 */

export const STORAGE_KEYS = {
  TOKEN: 'mindmint_token',
  TOKEN_EXPIRES_AT: 'mindmint_token_expires_at',
  USER: 'mindmint_user',
  USER_PROFILE: 'mindmint_user_profile',
  ACCOUNT_SETTINGS: 'mindmint_account_settings',
  NOTIFICATION_SCHEDULE: 'mindmint_notification_schedule',
  /**
   * Local snapshot of the signed-in user's store wallet (coins + lifelines).
   * The backend remains the source of truth; this is only a cache, keyed to
   * the user id so a different sign-in can never read another user's balance.
   * Cleared by clearSession() like every other key below.
   */
  WALLET_STATE: 'mindmint_wallet_state',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
