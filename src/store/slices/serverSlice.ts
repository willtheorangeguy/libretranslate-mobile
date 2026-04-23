import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ServerConfig } from '../../types';

interface ServerState {
  serverConfigs: ServerConfig[];
  activeServer: ServerConfig | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServerState = {
  serverConfigs: [],
  activeServer: null,
  loading: false,
  error: null,
};

export const serverSlice = createSlice({
  name: 'server',
  initialState,
  reducers: {
    addServer: (state, action: PayloadAction<ServerConfig>) => {
      state.serverConfigs.push(action.payload);
      if (!state.activeServer) {
        state.activeServer = action.payload;
      }
    },
    removeServer: (state, action: PayloadAction<string>) => {
      state.serverConfigs = state.serverConfigs.filter(s => s.url !== action.payload);
      if (state.activeServer?.url === action.payload) {
        state.activeServer = state.serverConfigs[0] || null;
      }
    },
    setActiveServer: (state, action: PayloadAction<ServerConfig>) => {
      state.activeServer = action.payload;
    },
    setServerLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setServerError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setServers: (state, action: PayloadAction<ServerConfig[]>) => {
      state.serverConfigs = action.payload;
    },
  },
});

export const {
  addServer,
  removeServer,
  setActiveServer,
  setServerLoading,
  setServerError,
  setServers,
} = serverSlice.actions;

export default serverSlice.reducer;
