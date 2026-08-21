import { configureStore } from '@reduxjs/toolkit';
import preferencesReducer from './features/preferences/preferencesSlice';
import notificationsReducer from './features/notifications/notificationsSlice';
import gameReducer from './components/GameMode/gameSliceStore';
import gameplayReducer from './features/gameplay/gameplaySlice';

export const store = configureStore({
  reducer: {
    preferences: preferencesReducer,
    notifications: notificationsReducer,
    game: gameReducer,
    gameplay: gameplayReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
