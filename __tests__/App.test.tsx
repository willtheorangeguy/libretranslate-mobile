import { store } from '../src/store';

test('store initializes with expected slices', () => {
  const state = store.getState();
  expect(state.translation).toBeDefined();
  expect(state.settings).toBeDefined();
  expect(state.server).toBeDefined();
});
