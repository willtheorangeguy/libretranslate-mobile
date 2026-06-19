// API Types
export interface Language {
  code: string;
  name: string;
}

export interface TranslationRequest {
  q: string;
  source: string;
  target: string;
}

export interface TranslationResponse {
  translatedText: string;
}

export type DetectionResponse = Array<{
  confidence: number;
  language: string;
}>;

// App State Types
export interface ServerConfig {
  url: string;
  isActive: boolean;
  lastValidated?: number;
  name?: string;
  apiKey?: string;
}

export interface Translation {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
  isFavorite: boolean;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export interface AppSettings {
  defaultSourceLang: string;
  defaultTargetLang: string;
  themeMode: ThemeMode;
  textSize: number;
  enableAutoDetect: boolean;
  onboardingCompleted: boolean;
}

// Navigation Types
export type RootStackParamList = {
  MainApp: undefined;
  ServerSetup: undefined;
  Onboarding: undefined;
};

export type BottomTabParamList = {
  Translate: undefined;
  History: undefined;
  Favorites: undefined;
  Settings: undefined;
};
