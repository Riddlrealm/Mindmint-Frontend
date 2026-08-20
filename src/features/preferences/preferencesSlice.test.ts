import { describe, expect, it } from 'vitest';
import reducer, { resetPreferences, setNotificationSchedule } from './preferencesSlice';
import { STORAGE_KEYS } from '../../session/storageKeys';

describe('preferencesSlice', () => {
  it('defaults to a Daily schedule when nothing is persisted', () => {
    const state = reducer(undefined, { type: '@@INIT' });

    expect(state.notificationSchedule).toBe('Daily');
  });

  it('setNotificationSchedule updates state and persists the choice', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    const next = reducer(state, setNotificationSchedule('Weekly'));

    expect(next.notificationSchedule).toBe('Weekly');
    expect(localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SCHEDULE)).toBe('Weekly');
  });

  it('resetPreferences restores the default schedule', () => {
    const state = reducer(undefined, setNotificationSchedule('Monthly'));
    const next = reducer(state, resetPreferences());

    expect(next.notificationSchedule).toBe('Daily');
  });
});
