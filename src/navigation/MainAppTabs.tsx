import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types';
import TranslateScreen from '../screens/TranslateScreen';
import HistoryScreen from '../screens/HistoryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<BottomTabParamList>();
type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export default function MainAppTabs() {
  const tabScreensOptions = useMemo(
    () => ({
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8E8E93',
      headerShown: true,
    }),
    []
  );

  const getTabIcon = (
    routeName: keyof BottomTabParamList,
    color: string,
    size: number
  ) => {
    const iconMap: Record<keyof BottomTabParamList, MaterialIconName> = {
      Translate: 'translate',
      History: 'history',
      Favorites: 'favorite',
      Settings: 'settings',
    };

    return <MaterialIcons name={iconMap[routeName]} size={size} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) =>
          getTabIcon(route.name as keyof BottomTabParamList, color, size),
        ...tabScreensOptions,
      })}
    >
      <Tab.Screen
        name="Translate"
        component={TranslateScreen}
        options={{ title: 'Translate' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}
