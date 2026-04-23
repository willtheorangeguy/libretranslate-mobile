import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Translation } from '../../types';

interface TranslationState {
  history: Translation[];
  favorites: Translation[];
  loading: boolean;
  error: string | null;
}

const initialState: TranslationState = {
  history: [],
  favorites: [],
  loading: false,
  error: null,
};

export const translationSlice = createSlice({
  name: 'translation',
  initialState,
  reducers: {
    addToHistory: (state, action: PayloadAction<Translation>) => {
      state.history.unshift(action.payload);
      if (state.history.length > 100) {
        state.history.pop();
      }
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const translation = state.history.find(t => t.id === action.payload);
      if (translation) {
        translation.isFavorite = !translation.isFavorite;
        state.favorites = state.history.filter(item => item.isFavorite);
      }
    },
    clearHistory: (state) => {
      state.history = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setHistoryAndFavorites: (
      state,
      action: PayloadAction<{ history: Translation[]; favorites: Translation[] }>
    ) => {
      state.history = action.payload.history;
      state.favorites = action.payload.favorites;
    },
    setHistory: (state, action: PayloadAction<Translation[]>) => {
      state.history = action.payload;
    },
    setFavorites: (state, action: PayloadAction<Translation[]>) => {
      state.favorites = action.payload;
    },
  },
});

export const {
  addToHistory,
  toggleFavorite,
  clearHistory,
  setLoading,
  setError,
  setHistoryAndFavorites,
  setHistory,
  setFavorites,
} = translationSlice.actions;

export default translationSlice.reducer;
