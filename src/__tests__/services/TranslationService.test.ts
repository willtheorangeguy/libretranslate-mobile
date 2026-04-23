import { TranslationService } from '../../services/TranslationService';
import * as LibreTranslateClient from '../../services/LibreTranslateClient';

jest.mock('../../services/LibreTranslateClient');

describe('TranslationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('translate', () => {
    it('should translate text with given language pair', async () => {
      const mockClient = {
        translate: jest.fn().mockResolvedValue({ translatedText: 'Hola' }),
      };

      (LibreTranslateClient.getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await TranslationService.translate('Hello', 'en', 'es');
      expect(result).toBe('Hola');
      expect(mockClient.translate).toHaveBeenCalledWith('Hello', 'en', 'es');
    });

    it('should return empty string for empty input', async () => {
      const result = await TranslationService.translate('', 'en', 'es');
      expect(result).toBe('');
    });
  });

  describe('getLanguages', () => {
    it('should return list of languages', async () => {
      const mockLanguages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
      ];

      const mockClient = {
        getLanguages: jest.fn().mockResolvedValue(mockLanguages),
      };

      (LibreTranslateClient.getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await TranslationService.getLanguages(true);
      expect(result).toEqual(mockLanguages);
    });
  });

  describe('detectLanguage', () => {
    it('should detect language of text', async () => {
      const mockClient = {
        detectLanguage: jest.fn().mockResolvedValue([{ language: 'en', confidence: 0.95 }]),
      };

      (LibreTranslateClient.getClient as jest.Mock).mockReturnValue(mockClient);

      const result = await TranslationService.detectLanguage('Hello world');
      expect(result).toBe('en');
    });
  });

  describe('clearCache', () => {
    it('should clear language cache', () => {
      expect(() => TranslationService.clearCache()).not.toThrow();
    });
  });
});
