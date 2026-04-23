import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings } from '../../types';

const defaultSettings: AppSettings = {
  defaultSourceLang: 'auto',
  defaultTargetLang: 'es',
  themeMode: 'system',
  textSize: 16,
  enableAutoDetect: true,
  onboardingCompleted: false,
};

interface SettingsState {
  settings: AppSettings;
}

const initialState: SettingsState = {
  settings: defaultSettings,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    resetSettings: (state) => {
      state.settings = defaultSettings;
    },
    setSettings: (state, action: PayloadAction<AppSettings>) => {
      state.settings = action.payload;
    },
  },
});

export const {
  updateSettings,
  resetSettings,
  setSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
