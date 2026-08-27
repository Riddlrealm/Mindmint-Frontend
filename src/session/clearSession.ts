import { clearNotifications } from '../features/notifications/notificationsSlice';
import { resetPreferences } from '../features/preferences/preferencesSlice';
import { resetStore } from '../features/store/storeSlice';
import { queryClient } from '../lib/queryClient';
import { store } from '../store';
import { useThemeStore } from '../theme/themeStore';
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
 * - persisted theme preference in localStorage and Zustand store
 * - in-memory notification queue and preferences in Redux
 * - in-memory react-query cache
 */
export function clearSession() {
  const localStorageRef =
    typeof window !== 'undefined' ? window.localStorage : undefined;

  queryClient.clear();
  store.dispatch(resetPreferences());
  store.dispatch(clearNotifications());
  useThemeStore.getState().resetTheme();
  useThemeStore.persist?.clearStorage();

  removeKeys(localStorageRef, SESSION_KEYS);
}
