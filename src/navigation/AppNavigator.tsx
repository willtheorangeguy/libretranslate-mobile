import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch } from '../hooks/useRedux';
import { setServers, setActiveServer } from '../store/slices/serverSlice';
import { setSettings } from '../store/slices/settingsSlice';
import { RootStackParamList } from '../types';
import ServerSetupScreen from '../screens/ServerSetupScreen';
import MainAppTabs from './MainAppTabs';
import { StorageService } from '../services/StorageService';
import { initializeClient } from '../services/LibreTranslateClient';
import { DatabaseService } from '../services/DatabaseService';
import OnboardingScreen from '../screens/OnboardingScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [hasServers, setHasServers] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const loadStoredData = useCallback(async () => {
    try {
      await DatabaseService.initialize();

      // Load servers
      const servers = await StorageService.getServers();
      const activeServer = await StorageService.getActiveServer();

      if (servers.length > 0) {
        dispatch(setServers(servers));
        if (activeServer) {
          dispatch(setActiveServer(activeServer));
          // Initialize client with active server
          initializeClient(activeServer.url, activeServer.apiKey);
        } else {
          // Initialize with first server if no active server
          dispatch(setActiveServer(servers[0]));
          initializeClient(servers[0].url, servers[0].apiKey);
        }
        setHasServers(true);
      }

      // Load settings
      const settings = await StorageService.getSettings();
      dispatch(setSettings(settings));

      const onboardingComplete = await StorageService.getOnboardingComplete();
      setShowOnboarding(!onboardingComplete || !settings.onboardingCompleted);
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  if (isLoading) {
    return null;
  }

  const initialRouteName: keyof RootStackParamList = showOnboarding
    ? 'Onboarding'
    : hasServers
      ? 'MainApp'
      : 'ServerSetup';

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={initialRouteName}
        initialRouteName={initialRouteName}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
        />
        <Stack.Screen
          name="ServerSetup"
          component={ServerSetupScreen}
        />
        <Stack.Screen name="MainApp" component={MainAppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
