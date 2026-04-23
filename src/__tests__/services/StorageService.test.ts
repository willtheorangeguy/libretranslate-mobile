import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../../services/StorageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns fallback settings when storage is empty', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const settings = await StorageService.getSettings();
    expect(settings.defaultSourceLang).toBe('auto');
    expect(settings.defaultTargetLang).toBe('es');
    expect(settings.themeMode).toBe('system');
  });

  it('saves onboarding completion flag', async () => {
    await StorageService.setOnboardingComplete(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('onboardingComplete', 'true');
  });
});
