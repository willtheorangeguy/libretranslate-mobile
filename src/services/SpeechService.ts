import Voice from '@react-native-community/voice';
import Tts from 'react-native-tts';

const LANGUAGE_TO_LOCALE: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ar: 'ar-SA',
};

type InitOptions = {
  onSpeechResult: (text: string) => void;
  onSpeechError: (message: string) => void;
  onSpeechEnd: () => void;
};

const toLocale = (langCode: string): string => LANGUAGE_TO_LOCALE[langCode] ?? 'en-US';

export const SpeechService = {
  initialized: false,

  async initialize(options: InitOptions): Promise<void> {
    if (this.initialized) {
      return;
    }

    Voice.onSpeechResults = event => {
      const text = event.value?.[0] ?? '';
      if (text) {
        options.onSpeechResult(text);
      }
    };

    Voice.onSpeechError = event => {
      const message = event.error?.message ?? 'Speech recognition failed.';
      options.onSpeechError(message);
    };

    Voice.onSpeechEnd = () => {
      options.onSpeechEnd();
    };

    await Tts.getInitStatus();
    this.initialized = true;
  },

  async startListening(languageCode: string): Promise<void> {
    await Voice.start(toLocale(languageCode));
  },

  async stopListening(): Promise<void> {
    await Voice.stop();
  },

  async speak(text: string, languageCode: string): Promise<void> {
    Tts.stop();
    Tts.setDefaultLanguage(toLocale(languageCode));
    Tts.speak(text);
  },

  stopSpeaking(): void {
    Tts.stop();
  },

  async cleanup(): Promise<void> {
    await Voice.destroy();
    Voice.removeAllListeners();
    this.initialized = false;
  },
};
