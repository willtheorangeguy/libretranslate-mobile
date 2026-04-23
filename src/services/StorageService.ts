import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ServerConfig } from '../types';
import { STORAGE_KEYS } from '../constants';

const SETTINGS_FALLBACK: AppSettings = {
  defaultSourceLang: 'auto',
  defaultTargetLang: 'es',
  themeMode: 'system',
  textSize: 16,
  enableAutoDetect: true,
  onboardingCompleted: false,
};

export const StorageService = {
  async saveServers(servers: ServerConfig[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SERVERS, JSON.stringify(servers));
  },

  async getServers(): Promise<ServerConfig[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVERS);
    return data ? (JSON.parse(data) as ServerConfig[]) : [];
  },

  async setActiveServer(server: ServerConfig): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SERVER, JSON.stringify(server));
  },

  async getActiveServer(): Promise<ServerConfig | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SERVER);
    return data ? (JSON.parse(data) as ServerConfig) : null;
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  async getSettings(): Promise<AppSettings> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) {
      return SETTINGS_FALLBACK;
    }

    const parsed = JSON.parse(data) as Partial<AppSettings>;
    return {
      ...SETTINGS_FALLBACK,
      ...parsed,
    };
  },

  async setOnboardingComplete(value: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, JSON.stringify(value));
  },

  async getOnboardingComplete(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value ? Boolean(JSON.parse(value)) : false;
  },

  async clearAllData(): Promise<void> {
    const keys = [
      STORAGE_KEYS.SERVERS,
      STORAGE_KEYS.ACTIVE_SERVER,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.ONBOARDING_COMPLETE,
    ];

    for (const key of keys) {
      await AsyncStorage.removeItem(key);
    }
  },
};
