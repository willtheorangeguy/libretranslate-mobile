import { configureStore } from '@reduxjs/toolkit';
import translationReducer from './slices/translationSlice';
import settingsReducer from './slices/settingsSlice';
import serverReducer from './slices/serverSlice';

export const store = configureStore({
  reducer: {
    translation: translationReducer,
    settings: settingsReducer,
    server: serverReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
