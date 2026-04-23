export const APP_NAME = 'LibreTranslate';
export const APP_VERSION = '1.0.0';

export const DEFAULT_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
];

export const STORAGE_KEYS = {
  SERVERS: 'servers',
  ACTIVE_SERVER: 'activeServer',
  SETTINGS: 'settings',
  ONBOARDING_COMPLETE: 'onboardingComplete',
};

export const API_TIMEOUTS = {
  TRANSLATE: 10000,
  DETECT: 5000,
  LANGUAGES: 5000,
};

export const UI_CONSTANTS = {
  MAX_HISTORY_ITEMS: 100,
  MAX_FAVORITES_ITEMS: 50,
  CHARACTER_LIMIT: 5000,
};

export const DEFAULT_TEXT_SIZE = 16;
