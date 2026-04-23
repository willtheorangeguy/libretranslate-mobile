import { getClient } from './LibreTranslateClient';
import { Language } from '../types';

let cachedLanguages: Language[] | null = null;
let languagesCacheTime = 0;
const CACHE_DURATION = 3600000; // 1 hour

export const TranslationService = {
  /**
   * Get available languages from the server
   */
  async getLanguages(forceRefresh: boolean = false): Promise<Language[]> {
    const now = Date.now();

    if (!forceRefresh && cachedLanguages && now - languagesCacheTime < CACHE_DURATION) {
      return cachedLanguages;
    }

    try {
      const client = getClient();
      const languages = await client.getLanguages();
      cachedLanguages = languages;
      languagesCacheTime = now;
      return languages;
    } catch (error) {
      // Return cached languages if available, even if expired
      if (cachedLanguages) {
        return cachedLanguages;
      }
      throw error;
    }
  },

  /**
   * Translate text from source to target language
   */
  async translate(
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<string> {
    if (!text.trim()) {
      return '';
    }

    const client = getClient();
    const response = await client.translate(text, sourceLang, targetLang);
    return response.translatedText;
  },

  /**
   * Detect the language of text
   */
  async detectLanguage(text: string): Promise<string> {
    if (!text.trim()) {
      return 'unknown';
    }

    const client = getClient();
    const response = await client.detectLanguage(text);
    return response[0]?.language ?? 'unknown';
  },

  /**
   * Clear the language cache
   */
  clearCache(): void {
    cachedLanguages = null;
    languagesCacheTime = 0;
  },

  /**
   * Validate if a language code is supported
   */
  async isLanguageSupported(languageCode: string): Promise<boolean> {
    const languages = await this.getLanguages();
    return languages.some(lang => lang.code === languageCode);
  },

  /**
   * Get language name from code
   */
  async getLanguageName(languageCode: string): Promise<string> {
    const languages = await this.getLanguages();
    const language = languages.find(lang => lang.code === languageCode);
    return language?.name || languageCode;
  },
};
