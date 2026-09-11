import React from 'react';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { MaterialDesignIcons as MaterialCommunityIcons } from '@react-native-vector-icons/material-design-icons/static';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeColors } from './src/theme';

function PaperIcon(props: {
  name: string;
  color?: string;
  size: number;
  direction: 'rtl' | 'ltr';
}) {
  return (
    <MaterialCommunityIcons
      {...props}
      name={props.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
    />
  );
}

function AppShell() {
  const colors = useThemeColors();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={colors.statusBarStyle} backgroundColor={colors.background} />
      <PaperProvider
        theme={{
          ...(colors.isDark ? MD3DarkTheme : MD3LightTheme),
          colors: {
            ...(colors.isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
            primary: colors.primary,
            primaryContainer: colors.surfaceAlt,
            onPrimaryContainer: colors.primary,
          },
        }}
        settings={{ icon: PaperIcon }}
      >
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <AppShell />
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });

export default App;
