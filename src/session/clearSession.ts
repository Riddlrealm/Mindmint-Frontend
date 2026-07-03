import { clearNotifications } from '../features/notifications/notificationsSlice';
import { resetPreferences } from '../features/preferences/preferencesSlice';
import { queryClient } from '../lib/queryClient';
import { store } from '../store';

const LOCAL_STORAGE_KEYS = [
  'mindmint_token',
  'mindmint_user',
  'mindmint_user_profile',
  'mindmint_account_settings',
  'mindmint_notification_schedule',
] as const;

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

export function clearSession() {
  const localStorageRef =
    typeof window !== 'undefined' ? window.localStorage : undefined;

  removeKeys(localStorageRef, LOCAL_STORAGE_KEYS);

  queryClient.clear();
  store.dispatch(resetPreferences());
  store.dispatch(clearNotifications());
}