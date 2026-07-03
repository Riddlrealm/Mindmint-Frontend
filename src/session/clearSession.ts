import { clearNotifications } from '../features/notifications/notificationsSlice';
import { resetPreferences } from '../features/preferences/preferencesSlice';
import { queryClient } from '../lib/queryClient';
import { store } from '../store';
import { STORAGE_KEYS } from './storageKeys';

const SESSION_KEYS: readonly string[] = Object.values(STORAGE_KEYS);

const removeKeys = (
  storage: Pick<Storage, 'removeItem'> | undefined,
  keys: readonly string[],
) => {
  if (!storage) {
    return;
  }

  for (const key of keys) {
    storage.removeItem(key);
  }
};

/**
 * Clears every cached Mindmint session artifact:
 * - auth token and user record from localStorage
 * - stored profile and account settings
 * - in-memory notification queue and preferences
 * - in-memory react-query cache
 */
export function clearSession() {
  const localStorageRef =
    typeof window !== 'undefined' ? window.localStorage : undefined;

  removeKeys(localStorageRef, SESSION_KEYS);

  queryClient.clear();
  store.dispatch(resetPreferences());
  store.dispatch(clearNotifications());
}
