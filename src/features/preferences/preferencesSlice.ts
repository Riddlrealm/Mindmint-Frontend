import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../session/storageKeys';
import { readJson, readString } from '../../session/storage';

export type NotificationSchedule = 'Daily' | 'Weekly' | 'Monthly' | 'Never';

const VALID_SCHEDULES: readonly NotificationSchedule[] = ['Daily', 'Weekly', 'Monthly', 'Never'];

interface PreferencesState {
  notificationSchedule: NotificationSchedule;
}

const DEFAULT_NOTIFICATION_SCHEDULE: NotificationSchedule = 'Daily';

const isAccountSettings = (
  value: unknown,
): value is { notifications?: { schedule?: unknown } } => {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  if (record.notifications === undefined) return true;
  return (
    record.notifications !== null &&
    typeof record.notifications === 'object'
  );
};

const readScheduleFromAccountSettings = (): NotificationSchedule | null => {
  // Guarded read: this runs at module-eval time, so a missing `window` or
  // corrupted value must never break app boot.
  const parsed = readJson(STORAGE_KEYS.ACCOUNT_SETTINGS, isAccountSettings);
  const schedule = parsed?.notifications?.schedule;
  if (VALID_SCHEDULES.includes(schedule as NotificationSchedule)) {
    return schedule as NotificationSchedule;
  }
  return null;
};

const readScheduleFromLocalStorage = (): NotificationSchedule | null => {
  const schedule = readString(STORAGE_KEYS.NOTIFICATION_SCHEDULE);
  if (VALID_SCHEDULES.includes(schedule as NotificationSchedule)) {
    return schedule as NotificationSchedule;
  }
  return null;
};

const getInitialSchedule = (): NotificationSchedule => {
  return readScheduleFromAccountSettings() ?? readScheduleFromLocalStorage() ?? DEFAULT_NOTIFICATION_SCHEDULE;
};

const initialState: PreferencesState = {
  notificationSchedule: getInitialSchedule(),
};

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setNotificationSchedule: (state, action: PayloadAction<NotificationSchedule>) => {
      state.notificationSchedule = action.payload;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SCHEDULE, action.payload);
    },
    resetPreferences: (state) => {
      state.notificationSchedule = DEFAULT_NOTIFICATION_SCHEDULE;
    },
  },
});

export const { setNotificationSchedule, resetPreferences } = preferencesSlice.actions;
export default preferencesSlice.reducer;
