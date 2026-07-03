import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../session/storageKeys';

export type NotificationSchedule = 'Daily' | 'Weekly' | 'Monthly' | 'Never';

const VALID_SCHEDULES: readonly NotificationSchedule[] = ['Daily', 'Weekly', 'Monthly', 'Never'];

interface PreferencesState {
  notificationSchedule: NotificationSchedule;
}

const DEFAULT_NOTIFICATION_SCHEDULE: NotificationSchedule = 'Daily';

const readScheduleFromAccountSettings = (): NotificationSchedule | null => {
  const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNT_SETTINGS);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { notifications?: { schedule?: unknown } };
    const schedule = parsed?.notifications?.schedule;
    if (VALID_SCHEDULES.includes(schedule as NotificationSchedule)) {
      return schedule as NotificationSchedule;
    }
  } catch {
    return null;
  }

  return null;
};

const readScheduleFromLocalStorage = (): NotificationSchedule | null => {
  const schedule = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SCHEDULE);
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
