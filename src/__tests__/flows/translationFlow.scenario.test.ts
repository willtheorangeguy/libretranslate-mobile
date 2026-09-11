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

test('editing a translation replaces its history row and preserves its favorite', () => {
  const entry: Translation = {
    id: 'draft',
    sourceText: 'Hi',
    translatedText: 'Hola',
    sourceLang: 'en',
    targetLang: 'es',
    timestamp: 1,
    isFavorite: false,
  };
  let state = translationReducer(undefined, addToHistory(entry));
  state = translationReducer(state, toggleFavorite(entry.id));
  state = translationReducer(state, addToHistory({ ...entry, sourceText: 'Hello', timestamp: 2 }));
  expect(state.history).toHaveLength(1);
  expect(state.history[0]).toMatchObject({ sourceText: 'Hello', isFavorite: true });
  expect(state.favorites[0]).toEqual(state.history[0]);
});
