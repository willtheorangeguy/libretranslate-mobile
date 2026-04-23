import translationReducer, {
  addToHistory,
  toggleFavorite,
} from '../../store/slices/translationSlice';
import { Translation } from '../../types';

describe('Translation flow scenario', () => {
  it('simulates translate -> history -> favorite flow', () => {
    const initial = translationReducer(undefined, { type: 'init' });
    const translation: Translation = {
      id: 'scenario-1',
      sourceText: 'hello',
      translatedText: 'hola',
      sourceLang: 'en',
      targetLang: 'es',
      timestamp: Date.now(),
      isFavorite: false,
    };

    const withHistory = translationReducer(initial, addToHistory(translation));
    expect(withHistory.history.length).toBe(1);

    const withFavorite = translationReducer(withHistory, toggleFavorite('scenario-1'));
    expect(withFavorite.history[0].isFavorite).toBe(true);
    expect(withFavorite.favorites.length).toBe(1);
  });
});
