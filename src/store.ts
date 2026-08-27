import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer from './features/preferences/preferencesSlice';
import notificationsReducer from './features/notifications/notificationsSlice';
import storeReducer from './features/store/storeSlice';
import gameReducer from './components/GameMode/gameSliceStore';

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    notifications: notificationsReducer,
    store: storeReducer,
    game: gameReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
