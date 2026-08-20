import { beforeEach, describe, expect, it } from 'vitest';
import { clearSession } from './clearSession';
import { STORAGE_KEYS } from './storageKeys';
import { store } from '../store';
import { addNotification } from '../features/notifications/notificationsSlice';
import { setNotificationSchedule } from '../features/preferences/preferencesSlice';

describe('clearSession', () => {
  beforeEach(() => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'token-123');
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, '1234567890000');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ id: 'user-1', email: 'jane@example.com' }));
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, '{"name":"Jane"}');
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_SETTINGS, '{"notifications":{"schedule":"Weekly"}}');
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SCHEDULE, 'Weekly');

    store.dispatch(setNotificationSchedule('Weekly'));
    store.dispatch(addNotification({ message: 'Welcome back!' }));
  });

  it('removes every persisted session artifact from localStorage', () => {
    clearSession();

    for (const key of Object.values(STORAGE_KEYS)) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it('resets in-memory preferences and notifications', () => {
    clearSession();

    const state = store.getState();
    expect(state.preferences.notificationSchedule).toBe('Daily');
    expect(state.notifications.items).toEqual([]);
  });
});
