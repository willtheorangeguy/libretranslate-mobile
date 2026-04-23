import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppSelector } from './src/hooks/useRedux';

function AppShell() {
  const systemDark = useColorScheme() === 'dark';
  const themeMode = useAppSelector(state => state.settings.settings.themeMode);
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && systemDark);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppShell />
    </Provider>
  );
}

export default App;
